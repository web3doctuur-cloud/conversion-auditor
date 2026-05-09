import { useReducer, useCallback } from 'react';
import { AuditReport } from '../types/audit';
import { runAudit } from '../lib/api';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: AuditReport[] }
  | { status: 'error'; message: string };

type Action =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: AuditReport[] }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

function reducer(_: State, action: Action): State {
  switch (action.type) {
    case 'FETCH':   return { status: 'loading' };
    case 'SUCCESS': return { status: 'success', data: action.data };
    case 'ERROR':   return { status: 'error', message: action.message };
    case 'RESET':   return { status: 'idle' };
  }
}

export function useAudit() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' });

  const audit = useCallback(async (urls: string[]) => {
    dispatch({ type: 'FETCH' });
    try {
      const data = await Promise.all(urls.map(url => runAudit(url)));
      dispatch({ type: 'SUCCESS', data });
    } catch (err) {
      dispatch({ type: 'ERROR', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, audit, reset };
}
