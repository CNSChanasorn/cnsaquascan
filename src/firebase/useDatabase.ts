import { useEffect, useState } from "react";

import { getDatabase, initializeDatabase } from "./database";

export function useDatabaseReady() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await initializeDatabase();
        if (isMounted) {
          setReady(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return { ready, error };
}

export async function getDatabaseAsync() {
  return await getDatabase();
}
