import { useState } from 'react';
import { ListService } from '../services/listService';

interface Props {
    listId: string;
    friends: any[]; // ProfilePage'den gelen arkadaş listesi
    existingCollaborators: string[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function ShareListModal({ listId, friends, existingCollaborators, onClose, onSuccess }: Props) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleShare = async (friendId: string, friendName: string) => {
        setLoadingId(friendId); // Sadece tıklanan arkadaşta loading dönsün

        try {
            await ListService.addCollaborator(listId, friendId);
            alert(`${friendName} added to the list! ✅`);
            onSuccess(); // Listeyi yenilemesi için ana sayfaya sinyal gönder
            onClose();   // Modalı kapat
        } catch (err) {
            console.error(err);
            alert('An error occurred or this person is already added.');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.content}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Choose Your Friend</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                {friends.length === 0 ? (
                    <p style={{ color: '#666' }}>You don't have any friends yet.</p>
                ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {friends.map((friendship) => {
                            // Arkadaşın verisi friendship objesinin içindeki 'receiver' veya 'sender' alanında olabilir.
                            // ProfilePage'deki yapıya göre 'receiver' kullanıyoruz:
                            const friend = friendship.friend;
                            const isAlreadyInvited = existingCollaborators.includes(friendship.receiver_id);

                            if (!friend) return null;

                            return (
                                <div key={friendship.receiver_id} style={modalStyles.friendRow}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={modalStyles.avatar}>
                                            {friend.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 'bold' }}>{friend.username}</span>
                                    </div>

                                    <button
                                        onClick={() => handleShare(friendship.receiver_id, friend.username)}
                                        disabled={loadingId === friendship.receiver_id || isAlreadyInvited}
                                        style={{
                                            ...modalStyles.inviteBtn,
                                            opacity: loadingId === friendship.receiver_id ? 0.7 : 1
                                        }}
                                    >
                                        {loadingId === friend.id ? 'Adding...' : isAlreadyInvited ? 'Added' : 'Invite'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Basit CSS stilleri
const modalStyles = {
    overlay: {
        position: 'fixed' as 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    content: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        width: '350px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    },
    friendRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        borderBottom: '1px solid #eee'
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#e0e7ff',
        color: '#4f46e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 'bold'
    },
    inviteBtn: {
        padding: '6px 12px',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.8rem'
    }
};