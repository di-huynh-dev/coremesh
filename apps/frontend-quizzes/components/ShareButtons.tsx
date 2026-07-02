'use client'

import React, { useState, useEffect } from 'react'
import { FaTwitter, FaLinkedin, FaRedditAlien } from 'react-icons/fa'
import { FiLink, FiCheck, FiShare2 } from 'react-icons/fi'

interface ShareButtonsProps {
    title: string
}

export default function ShareButtons({ title }: ShareButtonsProps) {
    const [url, setUrl] = useState('')
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setUrl(window.location.href)
        })
        return () => cancelAnimationFrame(frame)
    }, [])

    const handleCopy = async () => {
        if (!url) return
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(`Mastering this frontend topic: "${title}". Check it out on @FrontendPrep!`)

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-6 rounded-2xl border border-card-border bg-card-bg/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <FiShare2 className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">
                        Share this Resource
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                        Help other developers level up by sharing this study guide.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                {/* Twitter / X */}
                <a
                    href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-card-border bg-card-bg/40 text-text-muted hover:text-white hover:border-[#1da1f2]/30 hover:bg-[#1da1f2]/10 transition-all duration-200 cursor-pointer"
                    title="Share on Twitter / X"
                >
                    <FaTwitter className="w-3.5 h-3.5" />
                    <span>Twitter</span>
                </a>

                {/* LinkedIn */}
                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-card-border bg-card-bg/40 text-text-muted hover:text-white hover:border-[#0a66c2]/30 hover:bg-[#0a66c2]/10 transition-all duration-200 cursor-pointer"
                    title="Share on LinkedIn"
                >
                    <FaLinkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                </a>

                {/* Reddit */}
                <a
                    href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-card-border bg-card-bg/40 text-text-muted hover:text-white hover:border-[#ff4500]/30 hover:bg-[#ff4500]/10 transition-all duration-200 cursor-pointer"
                    title="Share on Reddit"
                >
                    <FaRedditAlien className="w-3.5 h-3.5" />
                    <span>Reddit</span>
                </a>

                {/* Copy Link Button */}
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer min-w-[110px] justify-center ${
                        copied
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'border-card-border bg-card-bg/40 text-text-muted hover:text-sky-400 hover:border-sky-500/30 hover:bg-sky-500/5'
                    }`}
                    title="Copy Link to Clipboard"
                >
                    {copied ? (
                        <>
                            <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <FiLink className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
