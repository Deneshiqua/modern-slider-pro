// Types previously imported from modern-fm-pro, now defined locally
export interface FileItem {
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
}

export interface UploadProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
}

export interface FileManagerAdapter {
    listFiles(path: string): Promise<FileItem[]>;
    createFolder(path: string, name: string): Promise<FileItem>;
    deleteItems(paths: string[]): Promise<void>;
    renameItem(path: string, newName: string): Promise<FileItem>;
    moveItems(sourcePaths: string[], targetPath: string): Promise<void>;
    copyItems(sourcePaths: string[], targetPath: string): Promise<void>;
    uploadFiles(path: string, files: File[], onProgress?: (progress: UploadProgress[]) => void): Promise<FileItem[]>;
    downloadFile(path: string): Promise<Blob>;
    saveFileContent(path: string, content: string | Blob): Promise<FileItem>;
    getPreviewUrl(path: string): string;
    getDownloadUrl(path: string): string;
    search(path: string, query: string): Promise<FileItem[]>;
}

interface LocalMediaEntry extends FileItem {
    content?: string;
}

const STORAGE_KEY = 'modern_fm_local_media';

const normalizePath = (path: string) => {
    if (!path || path === '/') {
        return '/';
    }

    const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
    const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')
        ? withLeadingSlash.slice(0, -1)
        : withLeadingSlash;
};

const getParentPath = (path: string) => {
    const normalizedPath = normalizePath(path);
    if (normalizedPath === '/') {
        return '/';
    }

    const lastSlashIndex = normalizedPath.lastIndexOf('/');
    return lastSlashIndex <= 0 ? '/' : normalizedPath.slice(0, lastSlashIndex);
};

const joinPath = (parentPath: string, name: string) => {
    const normalizedParentPath = normalizePath(parentPath);
    const trimmedName = name.trim().replace(/^\/+|\/+$/g, '');
    if (!trimmedName) {
        return normalizedParentPath;
    }

    return normalizedParentPath === '/'
        ? `/${trimmedName}`
        : `${normalizedParentPath}/${trimmedName}`;
};

const readEntries = (): LocalMediaEntry[] => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const storedValue = window.localStorage.getItem(STORAGE_KEY);
        if (!storedValue) {
            return [];
        }

        const parsedValue = JSON.parse(storedValue) as LocalMediaEntry[];
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
        return [];
    }
};

const writeEntries = (entries: LocalMediaEntry[]) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const getExtension = (name: string) => {
    const segments = name.split('.');
    return segments.length > 1 ? segments.pop()?.toLowerCase() ?? '' : '';
};

const createDataUrlFromText = (content: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

const dataUrlToBlob = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    return response.blob();
};

const cloneEntry = (entry: LocalMediaEntry): LocalMediaEntry => ({
    ...entry,
    id: crypto.randomUUID(),
});

export class LocalMediaAdapter implements FileManagerAdapter {
    private ensureUniqueName(entries: LocalMediaEntry[], parentPath: string, name: string, excludePath?: string) {
        const normalizedParentPath = normalizePath(parentPath);
        const extension = getExtension(name);
        const baseName = extension ? name.slice(0, -(extension.length + 1)) : name;
        let nextName = name;
        let index = 1;

        while (
            entries.some(
                (entry) =>
                    entry.parentPath === normalizedParentPath &&
                    entry.name === nextName &&
                    entry.path !== excludePath,
            )
        ) {
            nextName = extension ? `${baseName} (${index}).${extension}` : `${baseName} (${index})`;
            index += 1;
        }

        return nextName;
    }

    private replacePathPrefix(entry: LocalMediaEntry, oldPrefix: string, newPrefix: string): LocalMediaEntry {
        const nextPath = entry.path === oldPrefix ? newPrefix : entry.path.replace(`${oldPrefix}/`, `${newPrefix}/`);
        return {
            ...entry,
            path: normalizePath(nextPath),
            parentPath: getParentPath(nextPath),
            modifiedAt: new Date().toISOString(),
        };
    }

    async listFiles(path: string): Promise<FileItem[]> {
        const normalizedPath = normalizePath(path);
        return readEntries().filter((entry) => entry.parentPath === normalizedPath);
    }

    async createFolder(path: string, name: string): Promise<FileItem> {
        const entries = readEntries();
        const normalizedParentPath = normalizePath(path);
        const uniqueName = this.ensureUniqueName(entries, normalizedParentPath, name);
        const now = new Date().toISOString();
        const entry: LocalMediaEntry = {
            id: crypto.randomUUID(),
            name: uniqueName,
            isDirectory: true,
            size: 0,
            mimeType: 'inode/directory',
            path: joinPath(normalizedParentPath, uniqueName),
            parentPath: normalizedParentPath,
            createdAt: now,
            modifiedAt: now,
        };

        writeEntries([...entries, entry]);
        return entry;
    }

    async deleteItems(paths: string[]): Promise<void> {
        const normalizedPaths = paths.map((path) => normalizePath(path));
        const entries = readEntries().filter(
            (entry) => !normalizedPaths.some((path) => entry.path === path || entry.path.startsWith(`${path}/`)),
        );

        writeEntries(entries);
    }

    async renameItem(path: string, newName: string): Promise<FileItem> {
        const normalizedPath = normalizePath(path);
        const entries = readEntries();
        const targetEntry = entries.find((entry) => entry.path === normalizedPath);

        if (!targetEntry) {
            throw new Error('Item not found');
        }

        const uniqueName = this.ensureUniqueName(entries, targetEntry.parentPath, newName, targetEntry.path);
        const nextPath = joinPath(targetEntry.parentPath, uniqueName);

        const updatedEntries = entries.map((entry) => {
            if (entry.path === normalizedPath || entry.path.startsWith(`${normalizedPath}/`)) {
                const renamedEntry = this.replacePathPrefix(entry, normalizedPath, nextPath);
                return entry.path === normalizedPath ? { ...renamedEntry, name: uniqueName } : renamedEntry;
            }

            return entry;
        });

        writeEntries(updatedEntries);
        const updatedEntry = updatedEntries.find((entry) => entry.path === nextPath);
        if (!updatedEntry) {
            throw new Error('Rename failed');
        }

        return updatedEntry;
    }

    async moveItems(sourcePaths: string[], targetPath: string): Promise<void> {
        const normalizedTargetPath = normalizePath(targetPath);
        let entries = readEntries();

        for (const sourcePath of sourcePaths.map((path) => normalizePath(path))) {
            const entry = entries.find((item) => item.path === sourcePath);
            if (!entry) {
                continue;
            }

            const uniqueName = this.ensureUniqueName(entries, normalizedTargetPath, entry.name, sourcePath);
            const nextPath = joinPath(normalizedTargetPath, uniqueName);
            entries = entries.map((item) => {
                if (item.path === sourcePath || item.path.startsWith(`${sourcePath}/`)) {
                    const movedEntry = this.replacePathPrefix(item, sourcePath, nextPath);
                    return item.path === sourcePath ? { ...movedEntry, name: uniqueName } : movedEntry;
                }

                return item;
            });
        }

        writeEntries(entries);
    }

    async copyItems(sourcePaths: string[], targetPath: string): Promise<void> {
        const normalizedTargetPath = normalizePath(targetPath);
        const entries = readEntries();
        const nextEntries = [...entries];

        for (const sourcePath of sourcePaths.map((path) => normalizePath(path))) {
            const sourceEntry = entries.find((entry) => entry.path === sourcePath);
            if (!sourceEntry) {
                continue;
            }

            const uniqueName = this.ensureUniqueName(nextEntries, normalizedTargetPath, sourceEntry.name);
            const nextPath = joinPath(normalizedTargetPath, uniqueName);
            const entriesToCopy = entries
                .filter((entry) => entry.path === sourcePath || entry.path.startsWith(`${sourcePath}/`))
                .map((entry) => this.replacePathPrefix(cloneEntry(entry), sourcePath, nextPath));

            if (entriesToCopy.length > 0) {
                entriesToCopy[0].name = uniqueName;
            }

            nextEntries.push(...entriesToCopy);
        }

        writeEntries(nextEntries);
    }

    async uploadFiles(path: string, files: File[], onProgress?: (progress: UploadProgress[]) => void): Promise<FileItem[]> {
        const normalizedPath = normalizePath(path);
        const entries = readEntries();
        const progressState: UploadProgress[] = files.map((file) => ({
            file,
            progress: 0,
            status: 'pending',
        }));

        onProgress?.(progressState);

        const uploadedEntries: LocalMediaEntry[] = [];

        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            progressState[index] = { ...progressState[index], progress: 25, status: 'uploading' };
            onProgress?.([...progressState]);

            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });

            const uniqueName = this.ensureUniqueName([...entries, ...uploadedEntries], normalizedPath, file.name);
            const now = new Date().toISOString();
            const entry: LocalMediaEntry = {
                id: crypto.randomUUID(),
                name: uniqueName,
                isDirectory: false,
                size: file.size,
                mimeType: file.type || 'application/octet-stream',
                path: joinPath(normalizedPath, uniqueName),
                parentPath: normalizedPath,
                thumbnailUrl: file.type.startsWith('image/') ? dataUrl : undefined,
                createdAt: now,
                modifiedAt: now,
                content: dataUrl,
            };

            uploadedEntries.push(entry);
            progressState[index] = { ...progressState[index], progress: 100, status: 'success' };
            onProgress?.([...progressState]);
        }

        writeEntries([...entries, ...uploadedEntries]);
        return uploadedEntries;
    }

    async downloadFile(path: string): Promise<Blob> {
        const entry = readEntries().find((item) => item.path === normalizePath(path) && !item.isDirectory);
        if (!entry?.content) {
            throw new Error('File not found');
        }

        return dataUrlToBlob(entry.content);
    }

    async saveFileContent(path: string, content: string | Blob): Promise<FileItem> {
        const normalizedPath = normalizePath(path);
        const entries = readEntries();
        const entryIndex = entries.findIndex((entry) => entry.path === normalizedPath && !entry.isDirectory);

        if (entryIndex === -1) {
            throw new Error('File not found');
        }

        const currentEntry = entries[entryIndex];
        const nextContent =
            typeof content === 'string'
                ? createDataUrlFromText(content)
                : await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(reader.error ?? new Error('Failed to save file'));
                    reader.readAsDataURL(content);
                });

        const updatedEntry: LocalMediaEntry = {
            ...currentEntry,
            mimeType: typeof content === 'string' ? 'text/plain' : content.type || currentEntry.mimeType,
            size: typeof content === 'string' ? new Blob([content]).size : content.size,
            thumbnailUrl:
                (typeof content !== 'string' ? content.type : currentEntry.mimeType).startsWith('image/')
                    ? nextContent
                    : currentEntry.thumbnailUrl,
            modifiedAt: new Date().toISOString(),
            content: nextContent,
        };

        entries[entryIndex] = updatedEntry;
        writeEntries(entries);
        return updatedEntry;
    }

    getPreviewUrl(path: string): string {
        const entry = readEntries().find((item) => item.path === normalizePath(path) && !item.isDirectory);
        return entry?.content ?? '';
    }

    getDownloadUrl(path: string): string {
        return this.getPreviewUrl(path);
    }

    async search(path: string, query: string): Promise<FileItem[]> {
        const normalizedPath = normalizePath(path);
        const normalizedQuery = query.trim().toLowerCase();

        return readEntries().filter(
            (entry) =>
                entry.path.startsWith(normalizedPath === '/' ? '/' : `${normalizedPath}/`) &&
                entry.name.toLowerCase().includes(normalizedQuery),
        );
    }
}

export const localMediaAdapter = new LocalMediaAdapter();