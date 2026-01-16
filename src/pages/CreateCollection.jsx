import React, { useState } from 'react';
import { encodeCollection, generateId } from '../utils/urlUtils';
import AudioRecorder from '../components/AudioRecorder';
import '../styles/CreateCollection.css';

const CreateCollection = () => {
    const [collectionName, setCollectionName] = useState('');
    const [recipient, setRecipient] = useState('');
    const [letters, setLetters] = useState([
        { id: generateId(), type: 'text', label: '', content: '', audioData: null, releaseDate: null, scheduleEnabled: false }
    ]);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    const addLetter = () => {
        setLetters([...letters, {
            id: generateId(),
            type: 'text',
            label: '',
            content: '',
            audioData: null,
            releaseDate: null,
            scheduleEnabled: false
        }]);
    };

    const removeLetter = (index) => {
        if (letters.length > 1) {
            setLetters(letters.filter((_, i) => i !== index));
        }
    };

    const updateLetter = (index, field, value) => {
        const updated = [...letters];
        updated[index][field] = value;

        // If switching to voice, clear content; if switching to text, clear audio
        if (field === 'type') {
            if (value === 'voice') {
                updated[index].content = '';
            } else {
                updated[index].audioData = null;
            }
        }

        // If schedule disabled, clear release date
        if (field === 'scheduleEnabled' && !value) {
            updated[index].releaseDate = null;
        }

        setLetters(updated);
    };

    const isValid = () => {
        return letters.every(letter => {
            const hasLabel = letter.label.trim();
            const hasContent = letter.type === 'text' ? letter.content.trim() : letter.audioData;
            return hasLabel && hasContent;
        });
    };

    const handleCreate = () => {
        if (!isValid()) return;

        const collectionData = {
            id: generateId(),
            name: collectionName,
            recipient,
            letters: letters.map(letter => ({
                id: letter.id,
                type: letter.type,
                label: letter.label,
                content: letter.content,
                audioData: letter.audioData,
                releaseDate: letter.releaseDate
            })),
            createdAt: new Date().toISOString(),
        };

        const token = encodeCollection(collectionData);
        const link = `${window.location.origin}/${token}`;
        setGeneratedLink(link);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const resetForm = () => {
        setGeneratedLink(null);
        setCollectionName('');
        setRecipient('');
        setLetters([{ id: generateId(), type: 'text', label: '', content: '', audioData: null, releaseDate: null, scheduleEnabled: false }]);
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <div className="create-page paper-texture">
            <header className="header">
                <h1>Open When...</h1>
                <p className="subtitle">Create a collection of letters for special moments.</p>
            </header>

            {!generatedLink ? (
                <div className="form-container">
                    <div className="collection-info">
                        <div className="input-group">
                            <label>Collection Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., For Sarah, Birthday Letters"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                className="handwritten-input"
                            />
                        </div>

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
                    </div>

                    <div className="letters-section">
                        <h2 className="section-title">Your Letters</h2>

                        <div className="letters-list">
                            {letters.map((letter, index) => (
                                <div key={letter.id} className="letter-card">
                                    <div className="letter-card-header">
                                        <span className="letter-number">Letter {index + 1}</span>
                                        {letters.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-letter-btn"
                                                onClick={() => removeLetter(index)}
                                                aria-label="Remove letter"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>

                                    {/* Type Toggle */}
                                    <div className="type-toggle">
                                        <button
                                            type="button"
                                            className={`type-btn ${letter.type === 'text' ? 'active' : ''}`}
                                            onClick={() => updateLetter(index, 'type', 'text')}
                                        >
                                            ✎ Text
                                        </button>
                                        <button
                                            type="button"
                                            className={`type-btn ${letter.type === 'voice' ? 'active' : ''}`}
                                            onClick={() => updateLetter(index, 'type', 'voice')}
                                        >
                                            🎤 Voice
                                        </button>
                                    </div>

                                    <div className="input-group">
                                        <label>Open when...</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., you feel lonely, you need a laugh"
                                            value={letter.label}
                                            onChange={(e) => updateLetter(index, 'label', e.target.value)}
                                            className="handwritten-input"
                                        />
                                    </div>

                                    {/* Content Area - Text or Voice */}
                                    {letter.type === 'text' ? (
                                        <div className="input-group">
                                            <label>The Letter</label>
                                            <textarea
                                                placeholder="Write your heart out..."
                                                value={letter.content}
                                                onChange={(e) => updateLetter(index, 'content', e.target.value)}
                                                className="handwritten-textarea"
                                            />
                                        </div>
                                    ) : (
                                        <div className="input-group">
                                            <label>Record Your Voice</label>
                                            <AudioRecorder
                                                audioData={letter.audioData}
                                                onAudioChange={(data) => updateLetter(index, 'audioData', data)}
                                            />
                                        </div>
                                    )}

                                    {/* Schedule Option */}
                                    <div className="schedule-section">
                                        <label className="schedule-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={letter.scheduleEnabled}
                                                onChange={(e) => updateLetter(index, 'scheduleEnabled', e.target.checked)}
                                            />
                                            <span className="checkmark"></span>
                                            Schedule for a specific date
                                        </label>

                                        {letter.scheduleEnabled && (
                                            <div className="date-picker-wrapper">
                                                <input
                                                    type="date"
                                                    min={getMinDate()}
                                                    value={formatDateForInput(letter.releaseDate)}
                                                    onChange={(e) => updateLetter(index, 'releaseDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                                    className="date-picker"
                                                />
                                                <span className="date-hint">Letter will be locked until this date</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="add-letter-btn"
                            onClick={addLetter}
                        >
                            + Add Another Letter
                        </button>
                    </div>

                    <button
                        className="seal-button"
                        onClick={handleCreate}
                        disabled={!isValid()}
                    >
                        Seal {letters.length} {letters.length === 1 ? 'Letter' : 'Letters'} & Get Link
                    </button>
                </div>
            ) : (
                <div className="success-container">
                    <div className="envelopes-preview">
                        {letters.slice(0, 3).map((letter, index) => (
                            <div
                                key={letter.id}
                                className={`envelope-mini ${letter.type === 'voice' ? 'voice' : ''} ${letter.releaseDate ? 'scheduled' : ''}`}
                                style={{
                                    transform: `rotate(${(index - 1) * 8}deg) translateX(${(index - 1) * 20}px)`,
                                    zIndex: 3 - index
                                }}
                            >
                                <span className="stamp-mini">Post</span>
                                {letter.type === 'voice' && <span className="voice-badge">🎤</span>}
                                {letter.releaseDate && <span className="lock-badge">🔒</span>}
                                <p className="label-mini">Open when {letter.label}</p>
                            </div>
                        ))}
                        {letters.length > 3 && (
                            <span className="more-letters">+{letters.length - 3} more</span>
                        )}
                    </div>

                    <div className="link-section">
                        <p>Your collection of {letters.length} {letters.length === 1 ? 'letter is' : 'letters are'} sealed and ready.</p>
                        {(collectionName || recipient) && (
                            <p className="collection-meta">
                                {collectionName && <strong>"{collectionName}"</strong>}
                                {collectionName && recipient && ' for '}
                                {recipient && <span>{recipient}</span>}
                            </p>
                        )}
                        <div className="link-box">
                            <input type="text" readOnly value={generatedLink} />
                            <button onClick={copyToClipboard}>
                                {isCopied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                        <button className="create-another" onClick={resetForm}>
                            Write Another Collection
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateCollection;
