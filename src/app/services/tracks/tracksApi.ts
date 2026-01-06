// Временные заглушки для треков API
export const addToFavorites = async (trackId: string | number): Promise<void> => {
  console.log('Add to favorites:', trackId);
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const removeFromFavorites = async (trackId: string | number): Promise<void> => {
  console.log('Remove from favorites:', trackId);
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const getFavoriteTracks = async (): Promise<unknown[]> => {
  console.log('Get favorite tracks');
  await new Promise(resolve => setTimeout(resolve, 500));
  return [];
};