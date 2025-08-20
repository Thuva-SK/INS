import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Service {
  id: string;
  name: string;
  date: string;
}

interface ServiceMedia {
  id: string;
  service_id: string;
  url: string;
  type: 'image' | 'video';
}

const SocialService: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [media, setMedia] = useState<ServiceMedia[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', media: [] as File[] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch services and media from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: servicesData } = await supabase.from('socialservice').select('*').order('date', { ascending: false });
      const { data: mediaData } = await supabase.from('socialservice_media').select('*');
      setServices(servicesData || []);
      setMedia(mediaData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, media: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    // Insert service first
    const { data: serviceData, error: serviceError } = await supabase.from('socialservice').insert([{ name: form.name, date: form.date }]).select();
    if (serviceError || !serviceData || !serviceData[0]) {
      setUploading(false);
      return;
    }
    const serviceId = serviceData[0].id;
    // Upload media files
    const uploadedMedia: ServiceMedia[] = [];
    for (const file of form.media) {
      const ext = file.name.split('.').pop();
      const filePath = `socialservice/${serviceId}/${Date.now()}-${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage.from('socialservice-media').upload(filePath, file, { upsert: true });
      if (!storageError && storageData) {
        const url = supabase.storage.from('socialservice-media').getPublicUrl(filePath).data.publicUrl;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        uploadedMedia.push({ id: '', service_id: serviceId, url, type });
      }
    }
    // Insert media records
    if (uploadedMedia.length > 0) {
      await supabase.from('socialservice_media').insert(uploadedMedia.map(m => ({ service_id: m.service_id, url: m.url, type: m.type })));
    }
    // Refresh data
    const { data: servicesData } = await supabase.from('socialservice').select('*').order('date', { ascending: false });
    const { data: mediaData } = await supabase.from('socialservice_media').select('*');
    setServices(servicesData || []);
    setMedia(mediaData || []);
    setForm({ name: '', date: '', media: [] });
    setIsModalOpen(false);
    setUploading(false);
  };

  return (
    <div className="pt-16 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Social Service</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Service
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No services found. Add your first service!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Service Name</th>
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Album</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b">
                      <td className="py-2 px-4">{service.name}</td>
                      <td className="py-2 px-4">{service.date}</td>
                      <td className="py-2 px-4">
                        <div className="flex flex-wrap gap-2">
                          {media.filter(m => m.service_id === service.id).map((m, idx) => (
                            m.type === 'video' ? (
                              <video key={idx} src={m.url} controls className="w-20 h-16 object-cover rounded border max-w-full h-auto" />
                            ) : (
                              <img key={idx} src={m.url} alt="media" className="w-20 h-16 object-cover rounded border max-w-full h-auto" />
                            )
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Service Name"
                required
              />
              <Input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
              <Input
                name="media"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                disabled={uploading}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" className="admin-button-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialService; 