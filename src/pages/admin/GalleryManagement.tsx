import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  image_url?: string;
  created_at: string;
}

const GalleryManagement: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'image', url: '' });
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [detailsModal, setDetailsModal] = useState<{ item: GalleryItem | null, open: boolean }>({ item: null, open: false });
  const [error, setError] = useState<string>('');

  // Fetch gallery from Supabase with proper error handling
  const fetchGallery = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error: fetchError } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error fetching gallery:', fetchError);
        setError('Failed to load gallery items');
      } else {
        setGallery(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    }
    
    setLoading(false);
  };

  // Fetch a gallery item by id and show in modal
  const fetchGalleryItemById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('gallery')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching gallery item:', fetchError);
        setError('Failed to load item details');
      } else {
        setDetailsModal({ item: data, open: true });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    }
  };

  useEffect(() => {
    fetchGallery();
    
    // Real-time subscription
    const channel = supabase.channel('gallery-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, (payload) => {
        console.log('Gallery change detected:', payload);
        // Use setTimeout to avoid immediate refetch
        setTimeout(() => {
          fetchGallery();
        }, 100);
      })
      .subscribe();
    
    return () => { 
      channel.unsubscribe(); 
    };
  }, []);

  // Filtered gallery
  const filteredGallery = gallery.filter(item => {
    const matchesSearch =
      ((item.title || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((item.description || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or edit gallery item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let url = form.url;
    if (!file && !editingItem) {
      setError('Please select a file to upload.');
      return;
    }
    if (file) {
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file);
        if (uploadError) {
          setError('File upload failed: ' + uploadError.message);
          setUploading(false);
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);
        url = publicUrlData.publicUrl;
        if (!url) {
          setError('File upload failed: No public URL generated.');
          setUploading(false);
          return;
        }
        setUploading(false);
      } catch (err) {
        setError('File upload failed');
        setUploading(false);
        return;
      }
    }
    try {
      if (editingItem) {
        const { error: updateError } = await supabase
          .from('gallery')
          .update({ ...form, image_url: url, url })
          .eq('id', editingItem.id);
        if (updateError) {
          setError('Failed to update item: ' + updateError.message);
          return;
        }
      } else {
        if (!url) {
          setError('File upload failed: No URL generated.');
          return;
        }
        const { error: insertError } = await supabase
          .from('gallery')
          .insert([{ ...form, image_url: url, url }]);
        if (insertError) {
          setError('Failed to add item: ' + insertError.message);
          return;
        }
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setForm({ title: '', description: '', type: 'image', url: '' });
      setFile(null);
      fetchGallery();
    } catch (err) {
      setError('Database operation failed');
    }
  };

  // Edit button
  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({ title: item.title, description: item.description, type: item.type, url: item.url });
    setIsModalOpen(true);
  };

  // Delete button
  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        setError('Failed to delete item: ' + deleteError.message);
        return;
      }
      
      fetchGallery();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete item');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm({ title: '', description: '', type: 'image', url: '' });
    setFile(null);
    setError('');
  };

  return (
    <div className="space-y-6 pt-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gallery Management</h1>
          <br></br>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Gallery Items</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <Input 
              placeholder="Search gallery..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full md:w-1/3" 
            />
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)} 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No gallery items found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold">Title</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Preview</th>
                    <th className="py-3 px-4 font-semibold">Created At</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGallery.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium">{item.title}</td>
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="py-3 px-4">
                        <Badge variant={item.type === 'image' ? 'default' : 'secondary'}>
                          {item.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {item.type === 'image' ? (
                          (() => {
                            const src = item.image_url || item.url || 'https://via.placeholder.com/150?text=No+Image';
                            console.log('Final IMG SRC:', src);
                            return (
                              <img
                                src={src}
                                alt={item.title}
                                className="w-16 h-12 object-cover rounded-md border max-w-full h-auto"
                              />
                            );
                          })()
                        ) : item.type === 'video' ? (
                          <video 
                            src={item.url} 
                            className="w-16 h-12 object-cover rounded-md border max-w-full h-auto"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 underline text-sm"
                          >
                            View
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => fetchGalleryItemById(item.id)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Modal for Add/Edit Gallery Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="file">
                  {editingItem ? 'New File (optional)' : 'File'}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept={form.type === 'image' ? 'image/*' : 'video/*'}
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    required={!editingItem}
                    className="flex-1"
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {/* Show current file URL if editing */}
              {editingItem && editingItem.url && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current file:</p>
                  <a 
                    href={editingItem.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 underline text-sm"
                  >
                    View Current File
                  </a>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    editingItem ? 'Update' : 'Add'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModal.open && detailsModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gallery Item Details</h2>
              <Button 
                variant="outline"
                onClick={() => setDetailsModal({ item: null, open: false })}
              >
                Close
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Title:</span> {detailsModal.item.title}
              </div>
              <div>
                <span className="font-medium">Description:</span> {detailsModal.item.description}
              </div>
              <div>
                <span className="font-medium">Type:</span> 
                <Badge variant="outline" className="ml-2">
                  {detailsModal.item.type}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Created At:</span> {new Date(detailsModal.item.created_at).toLocaleString()}
              </div>
              <div>
                {detailsModal.item.type === 'image' ? (
                  <img 
                    src={detailsModal.item.image_url || detailsModal.item.url} 
                    alt={detailsModal.item.title} 
                    className="w-full max-h-48 object-cover rounded-lg border max-w-full h-auto"
                  />
                ) : detailsModal.item.type === 'video' ? (
                  <video 
                    src={detailsModal.item.url} 
                    controls 
                    className="w-full max-h-48 rounded-lg border max-w-full h-auto"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;