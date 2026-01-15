import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { decodeLetter } from '../utils/urlUtils';
import { storage } from '../utils/storage';
import '../styles/ViewLetter.css';

const ViewLetter = () => {
    const { token } = useParams();
    const [letter, setLetter] = useState(null);
    const [isOpened, setIsOpened] = useState(false);
    const [openTimestamp, setOpenTimestamp] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const decoded = decodeLetter(token);
        if (decoded) {
            setLetter(decoded);
            const opened = storage.isOpened(decoded.id);
            setIsOpened(opened);
            if (opened) {
                setOpenTimestamp(storage.getOpenTimestamp(decoded.id));
            }
        } else {
            setError(true);
        }
    }, [token]);

    const handleOpen = () => {
        if (letter) {
            storage.markAsOpened(letter.id);
            setIsOpened(true);
            setOpenTimestamp(new Date().toISOString());
        }
    };

    if (error) {
        return (
            <div className="error-page">
                <h1>Letter Not Found</h1>
                <p>This letter seems to have gotten lost in the mail.</p>
            </div>
        );
    }

    if (!letter) return <div className="loading">Checking the mailbox...</div>;

    return (
        <div className="view-page paper-texture">
            {!isOpened ? (
                <div className="sealed-view">
                    <div className="envelope-container" onClick={handleOpen}>
                        <div className="envelope">
                            <div className="flap"></div>
                            <div className="pocket"></div>
                            <div className="letter-preview"></div>
                            <div className="content-wrapper">
                                <div className="stamp">Post</div>
                                <div className="label-section">
                                    <p className="to-text">To: {letter.recipient || 'You'}</p>
                                    <h2 className="open-when-text">Open when {letter.label}</h2>
                                </div>
                                <p className="click-hint">(Click to open)</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="opened-view fade-in">
                    <div className="letter-paper">
                        <div className="letter-header">
                            <span className="date">Opened: {new Date(openTimestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="letter-body">
                            {letter.content.split('\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                        <div className="letter-footer">
                            <p>With love,</p>
                        </div>
                    </div>
                    <div className="envelope-remains">
                        <p className="status-text">This letter has been opened.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewLetter;
