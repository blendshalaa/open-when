import React, { useState } from 'react';
import { encodeLetter, generateId } from '../utils/urlUtils';
import '../styles/CreateLetter.css';

const CreateLetter = () => {
    const [recipient, setRecipient] = useState('');
    const [label, setLabel] = useState('');
    const [content, setContent] = useState('');
    const [generatedLink, setGeneratedLink] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleCreate = () => {
        if (!label.trim() || !content.trim()) return;

        const id = generateId();
        const letterData = {
            id,
            recipient,
            label,
            content,
            createdAt: new Date().toISOString(),
        };

        const token = encodeLetter(letterData);
        const link = `${window.location.origin}/letter/${token}`;
        setGeneratedLink(link);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="create-page paper-texture">
            <header className="header">
                <h1>Open When...</h1>
                <p className="subtitle">Write a letter for a future moment.</p>
            </header>

            {!generatedLink ? (
                <div className="form-container">
                    <div className="input-group">
                        <label>Who is this for? (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., My Best Friend"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            className="handwritten-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>Open when...</label>
                        <input
                            type="text"
                            placeholder="e.g., you feel lonely, you need a laugh"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="handwritten-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>The Letter</label>
                        <textarea
                            placeholder="Write your heart out..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="handwritten-textarea"
                        />
                    </div>

                    <button
                        className="seal-button"
                        onClick={handleCreate}
                        disabled={!label.trim() || !content.trim()}
                    >
                        Seal & Get Link
                    </button>
                </div>
            ) : (
                <div className="success-container">
                    <div className="envelope-preview">
                        <div className="envelope-front">
                            <span className="stamp">Post</span>
                            <div className="address">
                                <p>To: {recipient || 'You'}</p>
                                <p>Open when: {label}</p>
                            </div>
                        </div>
                    </div>

                    <div className="link-section">
                        <p>Your letter is sealed and ready.</p>
                        <div className="link-box">
                            <input type="text" readOnly value={generatedLink} />
                            <button onClick={copyToClipboard}>
                                {isCopied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                        <button
                            className="create-another"
                            onClick={() => {
                                setGeneratedLink(null);
                                setRecipient('');
                                setLabel('');
                                setContent('');
                            }}
                        >
                            Write Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateLetter;
