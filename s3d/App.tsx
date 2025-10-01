
import React, { useState, useMemo } from 'react';
import { Gender } from './types';
import { OUTFIT_OPTIONS } from './constants';
import { generateStyledImage } from './services/geminiService';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [outfit, setOutfit] = useState<string>(OUTFIT_OPTIONS[Gender.MALE][0]);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const outfitOptions = useMemo(() => OUTFIT_OPTIONS[gender], [gender]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setOriginalImage(URL.createObjectURL(file));
      setGeneratedImage(null);
      setError(null);
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGender = e.target.value as Gender;
    setGender(newGender);
    setOutfit(OUTFIT_OPTIONS[newGender][0]);
  };

  const handleGenerateClick = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const detailedPrompt = `A ${gender.toLowerCase()} wearing a ${outfit.toLowerCase()} outfit. ${description}`;

    try {
      const newImage = await generateStyledImage(imageFile, detailedPrompt);
      setGeneratedImage(newImage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI Image Styler
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Transform your photos with a new style.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Column */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl flex flex-col space-y-6 h-fit">
          <div className="space-y-2">
            <label className="text-lg font-semibold text-gray-300">1. Upload Image</label>
            <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center">
                <CameraIcon />
                <p className="mt-2 text-gray-400">{imageFile ? imageFile.name : 'Click or drag to upload'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="text-lg font-semibold text-gray-300">2. Select Gender</label>
            <select id="gender" value={gender} onChange={handleGenderChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
              {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="outfit" className="text-lg font-semibold text-gray-300">3. Select Outfit</label>
            <select id="outfit" value={outfit} onChange={(e) => setOutfit(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
              {outfitOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-lg font-semibold text-gray-300">4. Add Details (Optional)</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., standing in an urban environment, with a happy facial expression" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg h-24 resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" />
          </div>

          <button onClick={handleGenerateClick} disabled={isLoading || !imageFile} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            {isLoading ? <><Spinner /> Generating...</> : 'Generate Image'}
          </button>
          
          {error && <p className="text-red-400 text-center">{error}</p>}
        </div>

        {/* Image Display Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-400">Original Image</h2>
                <div className="aspect-square w-full bg-gray-800 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden">
                    {originalImage ? <img src={originalImage} alt="Original" className="object-cover w-full h-full" /> : <p className="text-gray-500">Upload an image to see it here</p>}
                </div>
            </div>
             <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-400">Generated Image</h2>
                <div className="aspect-square w-full bg-gray-800 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden">
                    {isLoading ? <Spinner /> : generatedImage ? <img src={generatedImage} alt="Generated" className="object-cover w-full h-full" /> : <p className="text-gray-500">Your generated image will appear here</p>}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
