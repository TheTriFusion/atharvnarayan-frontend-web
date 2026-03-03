import { useState, useEffect, useRef } from 'react';
import { documentsAPI, getImageUrl } from '../../utils/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const FILE_TYPES = ['all', 'image', 'pdf', 'doc', 'other'];
const RELATED_TO_OPTIONS = ['vehicle', 'driver', 'owner', 'bmc', 'trip', 'other'];

function DocViewerModal({ doc, onClose, baseUrl }) {
    if (!doc) return null;
    const url = getImageUrl(doc.fileUrl);
    const isPdf = doc.mimeType?.includes('pdf') || doc.fileName?.endsWith('.pdf');
    const isImage = doc.mimeType?.startsWith('image/');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div>
                        <h2 className="font-bold text-gray-800 text-lg truncate max-w-[500px]">{doc.title}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {doc.fileType?.toUpperCase()} · {doc.fileSizeKB} KB ·{' '}
                            {doc.uploadedBy?.name || 'Unknown'} ·{' '}
                            {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:underline font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
                        >
                            Open in Tab ↗
                        </a>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Viewer */}
                <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4 min-h-[400px]">
                    {isImage && (
                        <img
                            src={url}
                            alt={doc.title}
                            className="max-w-full max-h-[65vh] rounded-lg shadow object-contain"
                        />
                    )}
                    {isPdf && (
                        <iframe
                            src={url}
                            title={doc.title}
                            className="w-full rounded-lg shadow"
                            style={{ height: '65vh', minHeight: 400 }}
                        />
                    )}
                    {!isImage && !isPdf && (
                        <div className="text-center py-10">
                            <div className="text-6xl mb-4">📄</div>
                            <p className="text-gray-600 mb-4">Preview not available for this file type.</p>
                            <a
                                href={url}
                                download
                                className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>

                {doc.description && (
                    <div className="px-6 py-3 border-t text-sm text-gray-600">
                        {doc.description}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DocumentsManagement() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [search, setSearch] = useState('');
    const [viewDoc, setViewDoc] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '', description: '', fileType: 'other', relatedTo: '', relatedId: '', expiryDate: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const res = await documentsAPI.getDocuments();
            const list = res?.documents || res?.data || [];
            setDocuments(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Error loading documents:', err);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) { setUploadError('Please select a file'); return; }
        setUploading(true);
        setUploadError('');
        try {
            await documentsAPI.upload(selectedFile, {
                title: uploadData.title || selectedFile.name,
                description: uploadData.description,
                fileType: uploadData.fileType,
                relatedTo: uploadData.relatedTo || undefined,
                relatedId: uploadData.relatedId || undefined,
                expiryDate: uploadData.expiryDate || undefined,
            });
            setShowUploadForm(false);
            setSelectedFile(null);
            setUploadData({ title: '', description: '', fileType: 'other', relatedTo: '', relatedId: '', expiryDate: '' });
            await loadDocuments();
        } catch (err) {
            setUploadError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (doc) => {
        if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
        try {
            await documentsAPI.deleteDocument(doc._id);
            setDocuments(prev => prev.filter(d => d._id !== doc._id));
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const filtered = documents.filter(doc => {
        const matchesType = filterType === 'all' || doc.fileType === filterType;
        const term = search.toLowerCase();
        const matchesSearch = !term ||
            doc.title?.toLowerCase().includes(term) ||
            doc.description?.toLowerCase().includes(term) ||
            doc.uploadedBy?.name?.toLowerCase().includes(term) ||
            doc.relatedTo?.toLowerCase().includes(term);
        return matchesType && matchesSearch;
    });

    const getFileIcon = (mimeType, fileName) => {
        if (mimeType?.startsWith('image/')) return '🖼️';
        if (mimeType?.includes('pdf') || fileName?.endsWith('.pdf')) return '📋';
        if (mimeType?.includes('word') || fileName?.endsWith('.doc') || fileName?.endsWith('.docx')) return '📝';
        return '📄';
    };

    return (
        <div className="space-y-6">
            {/* Viewer Modal */}
            {viewDoc && <DocViewerModal doc={viewDoc} onClose={() => setViewDoc(null)} />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
                    <p className="text-gray-500 text-sm mt-1">Upload, view, and manage all documents</p>
                </div>
                <button
                    onClick={() => setShowUploadForm(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Upload Document
                </button>
            </div>

            {/* Upload Modal */}
            {showUploadForm && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Upload Document</h2>
                            <button onClick={() => setShowUploadForm(false)} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
                        </div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            {/* File input drag-drop */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50 transition"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={e => {
                                        const f = e.target.files[0];
                                        if (f) {
                                            setSelectedFile(f);
                                            if (!uploadData.title) setUploadData(p => ({ ...p, title: f.name }));
                                        }
                                    }}
                                />
                                {selectedFile ? (
                                    <div>
                                        <div className="text-4xl mb-1">{getFileIcon(selectedFile.type, selectedFile.name)}</div>
                                        <p className="font-medium text-gray-800">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-4xl mb-2">📁</div>
                                        <p className="text-gray-600 font-medium">Click to select file</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, DOC — max 5MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                                    <input
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        value={uploadData.title}
                                        onChange={e => setUploadData(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Document title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">File Type</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        value={uploadData.fileType}
                                        onChange={e => setUploadData(p => ({ ...p, fileType: e.target.value }))}
                                    >
                                        {['image', 'pdf', 'doc', 'other'].map(t => (
                                            <option key={t} value={t}>{t.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Related To</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        value={uploadData.relatedTo}
                                        onChange={e => setUploadData(p => ({ ...p, relatedTo: e.target.value }))}
                                    >
                                        <option value="">— none —</option>
                                        {RELATED_TO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description (optional)</label>
                                    <textarea
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                                        rows={2}
                                        value={uploadData.description}
                                        onChange={e => setUploadData(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Additional notes..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date (optional)</label>
                                    <input
                                        type="date"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        value={uploadData.expiryDate}
                                        onChange={e => setUploadData(p => ({ ...p, expiryDate: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {uploadError && (
                                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{uploadError}</p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowUploadForm(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition font-medium"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filters */}
            <Card>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex gap-1">
                        {FILE_TYPES.map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filterType === t
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <input
                        className="ml-auto border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[200px]"
                        placeholder="Search documents..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            {/* Documents Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                    Loading documents...
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-6xl mb-4">📂</div>
                    <p className="font-medium text-lg text-gray-500">No documents found</p>
                    <p className="text-sm mt-1">Upload your first document to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(doc => {
                        const url = getImageUrl(doc.fileUrl);
                        const isImage = doc.mimeType?.startsWith('image/');
                        const isPdf = doc.mimeType?.includes('pdf') || doc.fileName?.endsWith('.pdf');

                        return (
                            <div
                                key={doc._id}
                                className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition group"
                            >
                                {/* Preview */}
                                <div
                                    className="relative bg-gray-50 h-40 flex items-center justify-center cursor-pointer overflow-hidden"
                                    onClick={() => setViewDoc(doc)}
                                >
                                    {isImage ? (
                                        <img
                                            src={url}
                                            alt={doc.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="text-5xl">{getFileIcon(doc.mimeType, doc.fileName)}</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                                            View
                                        </span>
                                    </div>

                                    {/* Type badge */}
                                    <div className="absolute top-2 left-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isImage ? 'bg-purple-100 text-purple-700'
                                                : isPdf ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {doc.fileType?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <p className="font-semibold text-gray-800 text-sm truncate" title={doc.title}>{doc.title}</p>
                                    {doc.description && (
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{doc.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                                        <span>{doc.fileSizeKB} KB</span>
                                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {doc.relatedTo && (
                                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                            {doc.relatedTo}
                                        </span>
                                    )}
                                    {doc.expiryDate && new Date(doc.expiryDate) < new Date() && (
                                        <span className="inline-block ml-1 mt-1 text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                                            Expired
                                        </span>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => setViewDoc(doc)}
                                            className="flex-1 text-xs py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
                                        >
                                            👁 View
                                        </button>
                                        <a
                                            href={url}
                                            download
                                            className="text-xs py-1.5 px-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition font-medium"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            ⬇
                                        </a>
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            className="text-xs py-1.5 px-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
