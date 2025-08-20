import React, { useState } from 'react';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type GalleryItem } from '@/data/dummyData';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<GalleryItem, 'id'>) => void;
  item?: GalleryItem | null;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item
}) => {
  const [formData, setFormData] = useState<Omit<GalleryItem, 'id'>>({
    title: item?.title || '',
    type: item?.type || 'image',
    url: item?.url || '',
    thumbnail: item?.thumbnail || '',
    uploadDate: item?.uploadDate || new Date().toISOString().split('T')[0],
    description: item?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form if adding new item
    if (!item) {
      setFormData({
        title: '',
        type: 'image',
        url: '',
        thumbnail: '',
        uploadDate: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
  };

  const handleChange = (field: keyof Omit<GalleryItem, 'id'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateThumbnail = () => {
    if (formData.url && formData.type === 'image') {
      handleChange('thumbnail', formData.url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Gallery Item' : 'Upload New Media'}
          </DialogTitle>
          <DialogDescription>
            {item 
              ? 'Update the gallery item information below.'
              : 'Add a new image or video to the gallery.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter media title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Media Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="uploadDate">Upload Date *</Label>
              <Input
                id="uploadDate"
                type="date"
                value={formData.uploadDate}
                onChange={(e) => handleChange('uploadDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Media URL *</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder={formData.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/video.mp4'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <div className="flex gap-2">
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => handleChange('thumbnail', e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
              />
              {formData.type === 'image' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateThumbnail}
                  className="whitespace-nowrap"
                >
                  Use URL
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              For videos, provide a thumbnail image URL. For images, this will be used as a preview.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter a description for this media item..."
              rows={3}
            />
          </div>

          {/* Preview */}
          {formData.url && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted">
                {formData.type === 'image' ? (
                  <img
                    src={formData.thumbnail || formData.url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Preview';
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-purple-600">Video Preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="admin-button-primary">
              {item ? 'Update Item' : 'Upload Media'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryModal;