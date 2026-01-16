import React, { useState, useRef, useEffect } from 'react';
import '../styles/AudioRecorder.css';

const AudioRecorder = ({ audioData, onAudioChange }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    const MAX_DURATION = 120; // 2 minutes

    useEffect(() => {
        // If we have existing audio data, create URL for playback
        if (audioData && !audioUrl) {
            setAudioUrl(audioData);
        }
    }, [audioData]);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result;
                    setAudioUrl(base64);
                    onAudioChange(base64);
                };
                reader.readAsDataURL(blob);

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= MAX_DURATION - 1) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('Could not access microphone. Please grant permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const deleteRecording = () => {
        setAudioUrl(null);
        onAudioChange(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="audio-recorder">
            <div className="cassette-body">
                <div className="cassette-label">
                    <span className="cassette-title">Voice Note</span>
                    <span className="cassette-duration">
                        {isRecording ? formatTime(recordingTime) : audioUrl ? 'Ready' : 'Empty'}
                    </span>
                </div>

                <div className="cassette-reels">
                    <div className={`reel left ${isRecording ? 'spinning' : ''}`}>
                        <div className="reel-center"></div>
                    </div>
                    <div className="tape-window">
                        {isRecording && (
                            <div className="recording-indicator">
                                <span className="rec-dot"></span> REC
                            </div>
                        )}
                    </div>
                    <div className={`reel right ${isRecording ? 'spinning' : ''}`}>
                        <div className="reel-center"></div>
                    </div>
                </div>
            </div>

            <div className="recorder-controls">
                {!audioUrl ? (
                    <button
                        type="button"
                        className={`record-btn ${isRecording ? 'recording' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                    >
                        {isRecording ? '■ Stop' : '● Record'}
                    </button>
                ) : (
                    <div className="playback-controls">
                        <audio src={audioUrl} controls className="audio-preview" />
                        <button type="button" className="delete-btn" onClick={deleteRecording}>
                            Delete & Re-record
                        </button>
                    </div>
                )}

                {isRecording && (
                    <span className="time-remaining">
                        {formatTime(MAX_DURATION - recordingTime)} remaining
                    </span>
                )}
            </div>
        </div>
    );
};

export default AudioRecorder;
