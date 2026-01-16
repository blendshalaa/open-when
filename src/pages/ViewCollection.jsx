import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { decodeCollection } from '../utils/urlUtils';
import { storage } from '../utils/storage';
import AudioPlayer from '../components/AudioPlayer';
import '../styles/ViewCollection.css';

const ViewCollection = () => {
    const { token } = useParams();
    const [collection, setCollection] = useState(null);
    const [openedLetters, setOpenedLetters] = useState({});
    const [activeLetter, setActiveLetter] = useState(null);
    const [error, setError] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute for countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const decoded = decodeCollection(token);
        if (decoded) {
            setCollection(decoded);
            // Check opened state for each letter
            const openedState = {};
            decoded.letters.forEach(letter => {
                openedState[letter.id] = {
                    opened: storage.isLetterOpened(decoded.id, letter.id),
                    timestamp: storage.getLetterOpenTimestamp(decoded.id, letter.id)
                };
            });
            setOpenedLetters(openedState);
        } else {
            setError(true);
        }
    }, [token]);

    // Generate scattered positions for envelopes
    const envelopePositions = useMemo(() => {
        if (!collection) return [];

        const count = collection.letters.length;
        const positions = [];

        if (count === 1) {
            positions.push({ x: 50, y: 50, rotation: -2 });
        } else if (count === 2) {
            positions.push({ x: 35, y: 50, rotation: -8 });
            positions.push({ x: 65, y: 50, rotation: 5 });
        } else if (count === 3) {
            positions.push({ x: 30, y: 45, rotation: -10 });
            positions.push({ x: 55, y: 55, rotation: 3 });
            positions.push({ x: 70, y: 40, rotation: 8 });
        } else {
            const cols = Math.ceil(Math.sqrt(count));
            const rows = Math.ceil(count / cols);

            for (let i = 0; i < count; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;

                const baseX = 20 + (col / Math.max(cols - 1, 1)) * 60;
                const baseY = 25 + (row / Math.max(rows - 1, 1)) * 50;

                const offsetX = (Math.random() - 0.5) * 15;
                const offsetY = (Math.random() - 0.5) * 15;
                const rotation = (Math.random() - 0.5) * 20;

                positions.push({
                    x: Math.max(15, Math.min(85, baseX + offsetX)),
                    y: Math.max(20, Math.min(80, baseY + offsetY)),
                    rotation
                });
            }
        }

        return positions;
    }, [collection]);

    const isLetterLocked = (letter) => {
        if (!letter.releaseDate) return false;
        return new Date(letter.releaseDate) > currentTime;
    };

    const getTimeUntilRelease = (releaseDate) => {
        const release = new Date(releaseDate);
        const diff = release - currentTime;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} left`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} left`;
        } else {
            return 'Opening soon...';
        }
    };

    const formatReleaseDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleOpenLetter = (letter) => {
        if (isLetterLocked(letter)) {
            return; // Can't open locked letters
        }

        if (!openedLetters[letter.id]?.opened) {
            storage.markLetterAsOpened(collection.id, letter.id);
            setOpenedLetters(prev => ({
                ...prev,
                [letter.id]: {
                    opened: true,
                    timestamp: new Date().toISOString()
                }
            }));
        }
        setActiveLetter(letter);
    };

    const closeLetter = () => {
        setActiveLetter(null);
    };

    if (error) {
        return (
            <div className="error-page">
                <h1>Collection Not Found</h1>
                <p>These letters seem to have gotten lost in the mail.</p>
            </div>
        );
    }

    if (!collection) {
        return <div className="loading">Checking the mailbox...</div>;
    }

    return (
        <div className="view-collection-page">
            {/* Collection Header */}
            {(collection.name || collection.recipient) && (
                <header className="collection-header">
                    {collection.name && <h1 className="collection-name">{collection.name}</h1>}
                    {collection.recipient && (
                        <p className="collection-recipient">For {collection.recipient}</p>
                    )}
                </header>
            )}

            {/* Scattered Envelopes View */}
            {!activeLetter ? (
                <div className="envelopes-container">
                    {collection.letters.map((letter, index) => {
                        const pos = envelopePositions[index] || { x: 50, y: 50, rotation: 0 };
                        const isOpened = openedLetters[letter.id]?.opened;
                        const isLocked = isLetterLocked(letter);
                        const isVoice = letter.type === 'voice';

                        return (
                            <div
                                key={letter.id}
                                className={`envelope ${isOpened ? 'opened' : 'sealed'} ${isLocked ? 'locked' : ''} ${isVoice ? 'voice' : ''}`}
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
                                    zIndex: index + 1
                                }}
                                onClick={() => handleOpenLetter(letter)}
                            >
                                <div className="flap"></div>
                                <div className="pocket"></div>

                                {/* Locked Overlay */}
                                {isLocked && (
                                    <div className="locked-overlay">
                                        <div className="wax-seal">
                                            <span className="seal-icon">🔒</span>
                                        </div>
                                        <div className="lock-info">
                                            <span className="lock-date">Opens {formatReleaseDate(letter.releaseDate)}</span>
                                            <span className="lock-countdown">{getTimeUntilRelease(letter.releaseDate)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="envelope-content">
                                    <div className="stamp">Post</div>
                                    {isVoice && !isLocked && <div className="voice-indicator">🎤</div>}
                                    <div className="label-section">
                                        <p className="to-text">To: {collection.recipient || 'You'}</p>
                                        <h3 className="open-when-text">Open when {letter.label}</h3>
                                    </div>
                                    {isOpened && !isLocked && (
                                        <span className="opened-badge">Opened</span>
                                    )}
                                    {!isOpened && !isLocked && (
                                        <p className="click-hint">(Click to open)</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Opened Letter View */
                <div className="letter-view fade-in">
                    <button className="back-button" onClick={closeLetter}>
                        ← Back to letters
                    </button>

                    <div className="letter-paper paper-texture">
                        <div className="letter-header">
                            <span className="letter-label">
                                {activeLetter.type === 'voice' && '🎤 '}
                                Open when {activeLetter.label}
                            </span>
                            {openedLetters[activeLetter.id]?.timestamp && (
                                <span className="date">
                                    Opened: {new Date(openedLetters[activeLetter.id].timestamp).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <div className="letter-body">
                            {activeLetter.type === 'voice' ? (
                                <div className="voice-letter-content">
                                    <p className="voice-intro">Listen to this voice message:</p>
                                    <AudioPlayer audioData={activeLetter.audioData} />
                                </div>
                            ) : (
                                activeLetter.content.split('\n').map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))
                            )}
                        </div>

                        <div className="letter-footer">
                            <p>With love,</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress indicator */}
            {!activeLetter && (
                <div className="progress-indicator">
                    {Object.values(openedLetters).filter(l => l.opened).length} of {collection.letters.length} letters opened
                </div>
            )}
        </div>
    );
};

export default ViewCollection;
