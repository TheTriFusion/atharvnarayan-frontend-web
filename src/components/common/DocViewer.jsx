import { useState } from 'react';
import { getImageUrl } from '../../utils/api';

/**
 * Reusable inline document/image viewer
 * Pass an array of { label, url, type } objects
 * type: 'image' | 'pdf' | 'text'
 */
function DocPreview({ label, url, type = 'image', value }) {
    const [open, setOpen] = useState(false);
    const fullUrl = url ? getImageUrl(url) : null;

    if (!fullUrl && !value) return null;

    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>

            {/* Text value */}
            {value && (
                <span className="text-sm font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded border border-gray-200 inline-block">
                    {value}
                </span>
            )}

            {/* Image/PDF thumbnail */}
            {fullUrl && (
                <>
                    <button
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center gap-2 group"
                    >
                        {type === 'image' ? (
                            <img
                                src={fullUrl}
                                alt={label}
                                className="w-20 h-14 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all"
                            />
                        ) : (
                            <div className="w-20 h-14 flex items-center justify-center bg-red-50 rounded-lg border border-red-200 group-hover:bg-red-100 transition">
                                <span className="text-2xl">📋</span>
                            </div>
                        )}
                        <span className="text-xs text-blue-600 group-hover:underline font-medium">View</span>
                    </button>

                    {/* Lightbox */}
                    {open && (
                        <div
                            className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
                            onClick={() => setOpen(false)}
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
                                    <span className="font-semibold text-gray-800">{label}</span>
                                    <div className="flex gap-2">
                                        <a
                                            href={fullUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-blue-600 hover:underline px-3 py-1.5 border border-blue-200 rounded-lg"
                                        >
                                            Open in Tab ↗
                                        </a>
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4 min-h-[300px]">
                                    {type === 'pdf' ? (
                                        <iframe
                                            src={fullUrl}
                                            title={label}
                                            className="w-full rounded shadow"
                                            style={{ height: '60vh' }}
                                        />
                                    ) : (
                                        <img
                                            src={fullUrl}
                                            alt={label}
                                            className="max-w-full max-h-[60vh] rounded-lg shadow object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/**
 * UserDocumentsSection
 * Renders a clean section showing all KYC documents for a User
 * Pass: user object from API (has .documents, .profileImage, .companyDetails)
 */
export function UserDocumentsSection({ user }) {
    if (!user) return null;

    const docs = user.documents || {};
    const hasAnyDoc =
        user.profileImage ||
        docs.panCard || docs.panImage ||
        docs.aadhaarCard || docs.aadhaarFrontImage || docs.aadhaarBackImage ||
        docs.gstNumber || docs.gstDocument;

    if (!hasAnyDoc) {
        return (
            <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
                No documents uploaded
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Profile Photo */}
            {user.profileImage && (
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <DocPreview label="Profile Photo" url={user.profileImage} type="image" />
                    <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                        {user.companyDetails?.name && (
                            <p className="text-xs text-blue-600 mt-1">{user.companyDetails.name}</p>
                        )}
                    </div>
                </div>
            )}

            {/* PAN Card */}
            {(docs.panCard || docs.panImage) && (
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <DocPreview label="PAN Number" value={docs.panCard} />
                    <DocPreview label="PAN Card Image" url={docs.panImage} type="image" />
                </div>
            )}

            {/* Aadhaar Card */}
            {(docs.aadhaarCard || docs.aadhaarFrontImage || docs.aadhaarBackImage) && (
                <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-100">
                    <DocPreview label="Aadhaar Number" value={docs.aadhaarCard} />
                    <DocPreview label="Aadhaar Front" url={docs.aadhaarFrontImage} type="image" />
                    <DocPreview label="Aadhaar Back" url={docs.aadhaarBackImage} type="image" />
                </div>
            )}

            {/* GST */}
            {(docs.gstNumber || docs.gstDocument) && (
                <div className="grid grid-cols-2 gap-4">
                    <DocPreview label="GST Number" value={docs.gstNumber} />
                    <DocPreview label="GST Document" url={docs.gstDocument} type="pdf" />
                </div>
            )}
        </div>
    );
}

/**
 * TripImageGallery
 * Renders a grid of images from a trip (BMC collection images, dairy images, delivery images)
 */
export function TripImageGallery({ images = [], title = 'Trip Images' }) {
    const validImages = images.filter(img => img?.url);
    if (validImages.length === 0) return null;

    return (
        <div>
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{title}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {validImages.map((img, idx) => (
                    <DocPreview key={idx} label={img.label || `Image ${idx + 1}`} url={img.url} type="image" />
                ))}
            </div>
        </div>
    );
}

export default DocPreview;
