import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: '', content: '' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (!error && data) setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
    const channel = supabase.channel('announcements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: form.title, content: form.content };
    if (editingAnnouncement) {
      await supabase.from('announcements').update(payload).eq('id', editingAnnouncement.id);
    } else {
      await supabase.from('announcements').insert([payload]);
    }
    setModalOpen(false);
    setEditingAnnouncement(null);
    setForm({ title: '', content: '' });
    fetchAnnouncements();
  };

  const handleEdit = (a: Announcement) => {
    setEditingAnnouncement(a);
    setForm({ title: a.title, content: a.content });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    fetchAnnouncements();
  };

  return (
    <div className="space-y-6 pt-16">
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Announcements</CardTitle>
          <Button className="admin-button-primary flex items-center gap-2" onClick={() => { setModalOpen(true); setEditingAnnouncement(null); setForm({ title: '', content: '' }); }}>
            <Plus className="w-4 h-4" /> Add Announcement
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8">No announcements found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Title</th>
                    <th className="py-2 px-4">Content</th>
                    <th className="py-2 px-4">Created At</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 px-4">{a.title}</td>
                      <td className="py-2 px-4">{a.content}</td>
                      <td className="py-2 px-4">{new Date(a.created_at).toLocaleString()}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(a)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Announcement */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-card rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="admin-input w-full" required />
              <textarea name="content" value={form.content} onChange={handleChange} placeholder="Content" className="admin-input w-full" required />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingAnnouncement(null); }}>Cancel</Button>
                <Button type="submit" className="admin-button-primary">{editingAnnouncement ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement; 