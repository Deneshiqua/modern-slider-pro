import { createReadStream, promises as fs } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { basename, dirname, extname, join, posix, relative, resolve } from 'node:path';
import formidable, { type Fields, type File as FormidableFile, type Files } from 'formidable';
import type { Plugin } from 'vite';

type FileManagerItem = {
    id: string;
    name: string;
    isDirectory: boolean;
    size: number;
    mimeType: string;
    path: string;
    parentPath: string;
    thumbnailUrl?: string;
    createdAt: string;
    modifiedAt: string;
};

const API_BASE = '/api/files';
const UPLOADS_ROUTE = '/uploads';

const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
};

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
};

const sendError = (res: ServerResponse, statusCode: number, message: string) => {
    sendJson(res, statusCode, { error: message });
};

const getMimeType = (name: string) => MIME_TYPES[extname(name).toLowerCase()] ?? 'application/octet-stream';

const normalizeVirtualPath = (input?: string | null) => {
    const normalized = posix.normalize((input || UPLOADS_ROUTE).replace(/\\/g, '/'));
    const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;

    if (withLeadingSlash === '/') {
        return UPLOADS_ROUTE;
    }

    if (withLeadingSlash === UPLOADS_ROUTE) {
        return UPLOADS_ROUTE;
    }

    if (!withLeadingSlash.startsWith(`${UPLOADS_ROUTE}/`)) {
        throw new Error('Path is outside uploads root');
    }

    return withLeadingSlash;
};

const getParentVirtualPath = (virtualPath: string) => {
    const normalizedPath = normalizeVirtualPath(virtualPath);
    if (normalizedPath === UPLOADS_ROUTE) {
        return UPLOADS_ROUTE;
    }

    const parentPath = posix.dirname(normalizedPath);
    return parentPath === '/' ? UPLOADS_ROUTE : parentPath;
};

const toAbsolutePath = (uploadsRoot: string, virtualPath: string) => {
    const normalizedPath = normalizeVirtualPath(virtualPath);
    const relativePath = normalizedPath.slice(UPLOADS_ROUTE.length).replace(/^\/+/, '');
    const absolutePath = resolve(uploadsRoot, relativePath);
    const relativeToRoot = relative(uploadsRoot, absolutePath);

    if (relativeToRoot.startsWith('..') || relativeToRoot.includes('\0')) {
        throw new Error('Invalid path');
    }

    return absolutePath;
};

const toVirtualPath = (uploadsRoot: string, absolutePath: string) => {
    const relativePath = relative(uploadsRoot, absolutePath).split('\\').join('/');
    return relativePath ? `${UPLOADS_ROUTE}/${relativePath}` : UPLOADS_ROUTE;
};

const pathExists = async (targetPath: string) => {
    try {
        await fs.access(targetPath);
        return true;
    } catch {
        return false;
    }
};

const ensureUniqueName = async (targetDirectory: string, desiredName: string, excludePath?: string) => {
    const extension = extname(desiredName);
    const baseName = extension ? desiredName.slice(0, -extension.length) : desiredName;
    let nextName = desiredName;
    let index = 1;

    while (true) {
        const candidatePath = join(targetDirectory, nextName);
        if (!(await pathExists(candidatePath)) || candidatePath === excludePath) {
            return nextName;
        }

        nextName = extension ? `${baseName} (${index})${extension}` : `${baseName} (${index})`;
        index += 1;
    }
};

const buildFileItem = async (uploadsRoot: string, absolutePath: string): Promise<FileManagerItem> => {
    const stats = await fs.stat(absolutePath);
    const name = basename(absolutePath);
    const virtualPath = toVirtualPath(uploadsRoot, absolutePath);
    const mimeType = stats.isDirectory() ? 'inode/directory' : getMimeType(name);

    return {
        id: virtualPath,
        name,
        isDirectory: stats.isDirectory(),
        size: stats.isDirectory() ? 0 : stats.size,
        mimeType,
        path: virtualPath,
        parentPath: getParentVirtualPath(virtualPath),
        thumbnailUrl: !stats.isDirectory() && mimeType.startsWith('image/') ? virtualPath : undefined,
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
    };
};

const readJsonBody = async <T>(req: IncomingMessage): Promise<T> => {
    const chunks: Buffer[] = [];

    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as T;
};

const parseMultipart = async (req: IncomingMessage): Promise<{ fields: Fields; files: Files }> => {
    const form = formidable({ multiples: true, keepExtensions: true });

    return new Promise((resolve, reject) => {
        form.parse(req, (error, fields, files) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({ fields, files });
        });
    });
};

const getFieldValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const toFileArray = (value: FormidableFile | FormidableFile[] | undefined) => {
    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
};

const movePath = async (sourcePath: string, targetPath: string) => {
    try {
        await fs.rename(sourcePath, targetPath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EXDEV') {
            throw error;
        }

        await fs.cp(sourcePath, targetPath, { recursive: true, force: true });
        await fs.rm(sourcePath, { recursive: true, force: true });
    }
};

const collectMatches = async (uploadsRoot: string, currentPath: string, query: string, matches: FileManagerItem[]) => {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const absolutePath = join(currentPath, entry.name);
        const fileItem = await buildFileItem(uploadsRoot, absolutePath);

        if (fileItem.name.toLowerCase().includes(query)) {
            matches.push(fileItem);
        }

        if (entry.isDirectory()) {
            await collectMatches(uploadsRoot, absolutePath, query, matches);
        }
    }
};

const createUploadsStaticMiddleware = (uploadsRoot: string) => {
    return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!url.pathname.startsWith(UPLOADS_ROUTE)) {
            next();
            return;
        }

        try {
            const absolutePath = toAbsolutePath(uploadsRoot, url.pathname);
            const stats = await fs.stat(absolutePath);
            if (stats.isDirectory()) {
                next();
                return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', getMimeType(basename(absolutePath)));
            createReadStream(absolutePath).pipe(res);
        } catch {
            next();
        }
    };
};

const createFileManagerApiMiddleware = (uploadsRoot: string) => {
    return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!url.pathname.startsWith(API_BASE)) {
            next();
            return;
        }

        await fs.mkdir(uploadsRoot, { recursive: true });

        try {
            if (req.method === 'GET' && url.pathname === API_BASE) {
                const absolutePath = toAbsolutePath(uploadsRoot, url.searchParams.get('path') || UPLOADS_ROUTE);
                const stats = await fs.stat(absolutePath).catch(() => null);
                if (!stats || !stats.isDirectory()) {
                    sendJson(res, 200, []);
                    return;
                }

                const entries = await fs.readdir(absolutePath, { withFileTypes: true });
                const items = await Promise.all(entries.map((entry) => buildFileItem(uploadsRoot, join(absolutePath, entry.name))));
                items.sort((left, right) => {
                    if (left.isDirectory !== right.isDirectory) {
                        return left.isDirectory ? -1 : 1;
                    }

                    return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
                });
                sendJson(res, 200, items);
                return;
            }

            if (req.method === 'POST' && url.pathname === `${API_BASE}/folder`) {
                const body = await readJsonBody<{ path: string; name: string }>(req);
                const parentPath = toAbsolutePath(uploadsRoot, body.path);
                await fs.mkdir(parentPath, { recursive: true });
                const uniqueName = await ensureUniqueName(parentPath, body.name.trim());
                const targetPath = join(parentPath, uniqueName);
                await fs.mkdir(targetPath, { recursive: true });
                sendJson(res, 200, await buildFileItem(uploadsRoot, targetPath));
                return;
            }

            if (req.method === 'DELETE' && url.pathname === API_BASE) {
                const body = await readJsonBody<{ paths: string[] }>(req);
                await Promise.all(body.paths.map(async (itemPath) => {
                    const absolutePath = toAbsolutePath(uploadsRoot, itemPath);
                    await fs.rm(absolutePath, { recursive: true, force: true });
                }));
                res.statusCode = 204;
                res.end();
                return;
            }

            if (req.method === 'PATCH' && url.pathname === `${API_BASE}/rename`) {
                const body = await readJsonBody<{ path: string; newName: string }>(req);
                const sourcePath = toAbsolutePath(uploadsRoot, body.path);
                const targetDirectory = dirname(sourcePath);
                const uniqueName = await ensureUniqueName(targetDirectory, body.newName.trim(), sourcePath);
                const targetPath = join(targetDirectory, uniqueName);
                await movePath(sourcePath, targetPath);
                sendJson(res, 200, await buildFileItem(uploadsRoot, targetPath));
                return;
            }

            if (req.method === 'PATCH' && url.pathname === `${API_BASE}/move`) {
                const body = await readJsonBody<{ sourcePaths: string[]; targetPath: string }>(req);
                const targetDirectory = toAbsolutePath(uploadsRoot, body.targetPath);
                await fs.mkdir(targetDirectory, { recursive: true });

                for (const sourceVirtualPath of body.sourcePaths) {
                    const sourcePath = toAbsolutePath(uploadsRoot, sourceVirtualPath);
                    const uniqueName = await ensureUniqueName(targetDirectory, basename(sourcePath));
                    await movePath(sourcePath, join(targetDirectory, uniqueName));
                }

                res.statusCode = 204;
                res.end();
                return;
            }

            if (req.method === 'POST' && url.pathname === `${API_BASE}/copy`) {
                const body = await readJsonBody<{ sourcePaths: string[]; targetPath: string }>(req);
                const targetDirectory = toAbsolutePath(uploadsRoot, body.targetPath);
                await fs.mkdir(targetDirectory, { recursive: true });

                for (const sourceVirtualPath of body.sourcePaths) {
                    const sourcePath = toAbsolutePath(uploadsRoot, sourceVirtualPath);
                    const uniqueName = await ensureUniqueName(targetDirectory, basename(sourcePath));
                    await fs.cp(sourcePath, join(targetDirectory, uniqueName), { recursive: true, force: true });
                }

                res.statusCode = 204;
                res.end();
                return;
            }

            if (req.method === 'POST' && url.pathname === `${API_BASE}/upload`) {
                const { fields, files } = await parseMultipart(req);
                const targetDirectory = toAbsolutePath(uploadsRoot, getFieldValue(fields.path) || UPLOADS_ROUTE);
                await fs.mkdir(targetDirectory, { recursive: true });

                const uploadedItems: FileManagerItem[] = [];
                for (const file of toFileArray(files.files)) {
                    const originalName = file.originalFilename || `upload${extname(file.newFilename)}`;
                    const uniqueName = await ensureUniqueName(targetDirectory, originalName);
                    const targetPath = join(targetDirectory, uniqueName);
                    await movePath(file.filepath, targetPath);
                    uploadedItems.push(await buildFileItem(uploadsRoot, targetPath));
                }

                sendJson(res, 200, uploadedItems);
                return;
            }

            if (req.method === 'PUT' && url.pathname === `${API_BASE}/save`) {
                const { fields, files } = await parseMultipart(req);
                const virtualPath = getFieldValue(fields.path);
                if (!virtualPath) {
                    sendError(res, 400, 'Missing path');
                    return;
                }

                const targetPath = toAbsolutePath(uploadsRoot, virtualPath);
                await fs.mkdir(dirname(targetPath), { recursive: true });
                const contentFile = toFileArray(files.content)[0];
                if (!contentFile) {
                    sendError(res, 400, 'Missing content');
                    return;
                }

                await movePath(contentFile.filepath, targetPath);
                sendJson(res, 200, await buildFileItem(uploadsRoot, targetPath));
                return;
            }

            if (req.method === 'GET' && (url.pathname === `${API_BASE}/download` || url.pathname === `${API_BASE}/preview`)) {
                const absolutePath = toAbsolutePath(uploadsRoot, url.searchParams.get('path') || UPLOADS_ROUTE);
                const stats = await fs.stat(absolutePath);
                if (stats.isDirectory()) {
                    sendError(res, 400, 'Directories cannot be previewed');
                    return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', getMimeType(basename(absolutePath)));
                if (url.pathname.endsWith('/download')) {
                    res.setHeader('Content-Disposition', `attachment; filename="${basename(absolutePath)}"`);
                }
                createReadStream(absolutePath).pipe(res);
                return;
            }

            if (req.method === 'GET' && url.pathname === `${API_BASE}/search`) {
                const absolutePath = toAbsolutePath(uploadsRoot, url.searchParams.get('path') || UPLOADS_ROUTE);
                const query = (url.searchParams.get('q') || '').trim().toLowerCase();
                if (!query) {
                    sendJson(res, 200, []);
                    return;
                }

                const matches: FileManagerItem[] = [];
                const stats = await fs.stat(absolutePath).catch(() => null);
                if (stats?.isDirectory()) {
                    await collectMatches(uploadsRoot, absolutePath, query, matches);
                }

                sendJson(res, 200, matches);
                return;
            }

            next();
        } catch (error) {
            sendError(res, 500, error instanceof Error ? error.message : 'Unexpected file API error');
        }
    };
};

export const fileManagerApiPlugin = (): Plugin => {
    return {
        name: 'file-manager-api',
        configureServer(server) {
            const uploadsRoot = resolve(server.config.root, 'public', 'uploads');
            server.middlewares.use(createUploadsStaticMiddleware(uploadsRoot));
            server.middlewares.use(createFileManagerApiMiddleware(uploadsRoot));
        },
        configurePreviewServer(server) {
            const uploadsRoot = resolve(server.config.root, 'public', 'uploads');
            server.middlewares.use(createUploadsStaticMiddleware(uploadsRoot));
            server.middlewares.use(createFileManagerApiMiddleware(uploadsRoot));
        },
    };
};