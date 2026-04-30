const COVER_ART_BASE_URL = 'https://coverartarchive.org/release';

export const getCoverArtUrl = (releaseId: string): string =>
  `${COVER_ART_BASE_URL}/${releaseId}/front`;

export const testCoverArtArchive = async (): Promise<boolean> => {
  try {
    // Test with a real MBID from the documentation example
    const testMbid = '76df3287-6cda-33eb-8e9a-044b5e15ffdd';
    const testUrl = `${COVER_ART_BASE_URL}/${testMbid}`;

    console.log('Testing Cover Art Archive with URL:', testUrl);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Cover Art Archive test response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Cover Art Archive test successful, images found:', data.images?.length);
      return true;
    } else {
      console.error('Cover Art Archive test failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Cover Art Archive test error:', error);
    return false;
  }
};
