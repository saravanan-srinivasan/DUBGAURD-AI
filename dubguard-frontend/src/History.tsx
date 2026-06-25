import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';
import { Clock, FileText, Download, Music, Globe, Users, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface HistoryItem {
  id: string;
  type: 'voice' | 'voice-multi' | 'translation' | 'summary' | 'emotion' | 'isolation' | string;
  timestamp: number;
  data: any;
}

const History: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    setLoading(true);
    
    const q = query(
      collection(db, 'generations'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedItems: HistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });
      setItems(fetchedItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching history:", error);
      toast.error(`History Error: ${error.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await deleteDoc(doc(db, 'generations', id));
      toast.success("Item deleted from history.");
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete item.");
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'voice': return <Music size={20} color="#a855f7" />;
      case 'voice-multi': return <Users size={20} color="#ec4899" />;
      case 'translation': return <Globe size={20} color="#6366f1" />;
      case 'summary': return <FileText size={20} color="#10b981" />;
      default: return <Clock size={20} color="#f59e0b" />;
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Clock size={14} /> My Library</div>
        <h1>Your <span className="gradient-text">History</span></h1>
        <p>Access your recently generated audio, translations, and summaries.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Loading history...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 1rem' }}>
            <Clock size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <h3>No history yet</h3>
            <p>Your generations will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div key={item.id} className="animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  {getIcon(item.type)}
                </div>
                
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    {new Date(item.timestamp).toLocaleString()} • {item.type}
                  </div>
                  
                  {item.type === 'voice' && item.data?.text && (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{item.data.text}"
                    </p>
                  )}

                  {item.type === 'voice-multi' && (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Multi-Speaker Podcast generated successfully.
                    </p>
                  )}

                  {item.type === 'summary' && (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Podcast Summary generated successfully.
                    </p>
                  )}

                  {item.type === 'translation' && (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Audio Translation generated successfully.
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {item.data?.audioUrl && (
                    <a href={item.data.audioUrl} download={`${item.type}.mp3`} className="download-btn" style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
                      <Download size={18} /> Audio
                    </a>
                  )}
                  {item.data?.summary && (
                    <button onClick={() => {
                        const blob = new Blob([item.data.summary], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'summary.md';
                        a.click();
                      }} 
                      className="download-btn" style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}
                    >
                      <Download size={18} /> MD
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '0.5rem', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
                    title="Delete item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
