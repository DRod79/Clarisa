import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Video, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FileUpload = ({ onUploadComplete, existingFileUrl = null, folder = 'recursos' }) => {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(existingFileUrl);
  const [fileName, setFileName] = useState(existingFileUrl ? existingFileUrl.split('/').pop() : '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return Image;
    if (['mp4', 'mov', 'avi'].includes(ext)) return Video;
    if (['pdf', 'doc', 'docx'].includes(ext)) return FileText;
    return File;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validar tamaño (50MB)
    if (file.size > 52428800) {
      toast.error('El archivo excede el límite de 50MB');
      return;
    }

    // Validar tipo
    const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'mp4', 'mov'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch(`${BACKEND_URL}/api/admin/recursos/upload-file`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFileUrl(data.url);
        setFileName(data.filename);
        toast.success('Archivo subido correctamente');
        
        if (onUploadComplete) {
          onUploadComplete(data.url, data.file_path);
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al subir archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFileUrl(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUploadComplete) {
      onUploadComplete(null, null);
    }
  };

  const FileIcon = fileName ? getFileIcon(fileName) : Upload;

  return (
    <div className="w-full">
      {!fileUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-[#4CAF50] bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.mp4,.mov"
          />

          {uploading ? (
            <div className="py-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#4CAF50]"></div>
              <p className="mt-4 text-gray-600">Subiendo archivo...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, Imágenes, Documentos, Videos (máx. 50MB)
              </p>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
              >
                Seleccionar Archivo
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FileIcon className="w-6 h-6 text-[#4CAF50]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{fileName}</p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4CAF50] hover:underline"
                >
                  Ver archivo
                </a>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleRemove}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
