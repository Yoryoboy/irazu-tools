import { useEffect, useState } from 'react';
import { FetchUserHierarchyResponse, UserHierarchy } from '../types/MQMS';

const jorgeEmpID = 'd1425720-916f-4e82-b4c7-4a624bbc9289';
const anaisEmpID = '2a37f9ca-fafa-4188-a0c9-ee18f60ac43d';

export function useMQMSDesignTeam(accessToken: string | undefined) {
  const [userHierarchy, setUserHierarchy] = useState<UserHierarchy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserHierarchy(EMP_ID: string) {
      const url = `https://mqms.corp.chartercom.com/api/userHierarchy?userID=${EMP_ID}&dateAdd=0&initialLoad=true&srcTimezone=America/Buenos_Aires`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorizations: accessToken as string,
      };

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch MQMS user hierarchy');
        }

        const responseData: FetchUserHierarchyResponse = await response.json();

        const { status, message, data } = responseData;

        if (status !== 'success' || !data?.userHierarchy) {
          throw new Error(`Failed to fetch MQMS user hierarchy: ${message || 'Unknown error'}`);
        }
        return data.userHierarchy;
      } catch (error) {
        console.error('Error fetching MQMS user hierarchy:', error);
      }
    }

    async function fetchAllHierarchies() {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all([
          fetchUserHierarchy(jorgeEmpID),
          fetchUserHierarchy(anaisEmpID),
        ]);

        const combinedHierarchy = results.flat();
        setUserHierarchy(combinedHierarchy as UserHierarchy[]);
      } catch (err) {
        setError('Error fetchinh hierarchies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (accessToken) {
      fetchAllHierarchies();
    }
  }, [accessToken]);

  return { userHierarchy, loading, error };
}
