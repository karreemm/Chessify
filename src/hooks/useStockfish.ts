import { useRef, useCallback, useEffect, useState } from "react";
import { getThinkTime } from "@/lib/themes";

const STOCKFISH_PATH = "/stockfish.js";
const STARTUP_TIMEOUT = 8000;

type MessageListener = (message: string) => void;
type ReadyListener = (ready: boolean) => void;
type ErrorListener = () => void;

type PendingRequest = {
  resolve: (move: string) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout> | null;
};

let sharedWorker: Worker | null = null;
let sharedReady = false;
let sharedLevel = 5;

const messageListeners = new Set<MessageListener>();
const readyListeners = new Set<ReadyListener>();
const errorListeners = new Set<ErrorListener>();

function broadcastReady(ready: boolean) {
  sharedReady = ready;
  readyListeners.forEach((listener) => listener(ready));
}

function broadcastMessage(message: string) {
  messageListeners.forEach((listener) => listener(message));
}

function broadcastError() {
  broadcastReady(false);
  errorListeners.forEach((listener) => listener());
}

function createWorker() {
  if (typeof window === "undefined") return null;
  if (sharedWorker) return sharedWorker;

  const worker = new Worker(new URL(STOCKFISH_PATH, window.location.origin), {
    type: "classic",
    name: "stockfish-engine",
  });

  sharedWorker = worker;
  broadcastReady(false);

  worker.onmessage = (event: MessageEvent) => {
    const message =
      typeof event.data === "string" ? event.data : String(event.data ?? "");
    broadcastMessage(message);

    if (message.includes("uciok")) {
      worker.postMessage(`setoption name Skill Level value ${sharedLevel}`);
      worker.postMessage("ucinewgame");
      worker.postMessage("isready");
      return;
    }

    if (message.includes("readyok")) {
      broadcastReady(true);
    }
  };

  worker.onerror = () => {
    worker.terminate();
    if (sharedWorker === worker) {
      sharedWorker = null;
    }
    broadcastError();
  };

  worker.postMessage("uci");
  return worker;
}

function restartWorker() {
  if (sharedWorker) {
    sharedWorker.terminate();
    sharedWorker = null;
  }

  return createWorker();
}

export function useStockfish(level: number) {
  const [isReady, setIsReady] = useState(sharedReady);
  const [isThinking, setIsThinking] = useState(false);
  const pendingRef = useRef<PendingRequest | null>(null);
  const levelRef = useRef(level);
  levelRef.current = level;

  const clearPending = useCallback(() => {
    if (pendingRef.current?.timeout) {
      clearTimeout(pendingRef.current.timeout);
    }
    pendingRef.current = null;
  }, []);

  const resolvePending = useCallback(
    (move: string) => {
      const pending = pendingRef.current;
      clearPending();
      setIsThinking(false);
      pending?.resolve(move);
    },
    [clearPending],
  );

  const rejectPending = useCallback(
    (message: string) => {
      const pending = pendingRef.current;
      clearPending();
      setIsThinking(false);
      pending?.reject(new Error(message));
    },
    [clearPending],
  );

  useEffect(() => {
    const handleReady = (ready: boolean) => setIsReady(ready);
    const handleMessage = (message: string) => {
      if (!message.startsWith("bestmove")) return;
      const move = message.split(/\s+/)[1] ?? "";
      resolvePending(move === "(none)" ? "" : move);
    };
    const handleError = () => rejectPending("Stockfish worker failed");

    readyListeners.add(handleReady);
    messageListeners.add(handleMessage);
    errorListeners.add(handleError);

    createWorker();

    const startupTimer = window.setTimeout(() => {
      if (!sharedReady) {
        restartWorker();
      }
    }, STARTUP_TIMEOUT);

    return () => {
      window.clearTimeout(startupTimer);
      readyListeners.delete(handleReady);
      messageListeners.delete(handleMessage);
      errorListeners.delete(handleError);
      clearPending();
    };
  }, [clearPending, rejectPending, resolvePending]);

  useEffect(() => {
    sharedLevel = level;
    const worker = sharedWorker ?? createWorker();
    if (!worker || !sharedReady) return;

    broadcastReady(false);
    worker.postMessage(`setoption name Skill Level value ${level}`);
    worker.postMessage("ucinewgame");
    worker.postMessage("isready");
  }, [level]);

  const getBestMove = useCallback(
    (fen: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const worker = sharedWorker ?? createWorker();

        if (!worker) {
          reject(new Error("Engine unavailable"));
          return;
        }

        if (!sharedReady) {
          restartWorker();
          reject(new Error("Engine not ready"));
          return;
        }

        clearPending();
        setIsThinking(true);

        const thinkTime = getThinkTime(levelRef.current);
        pendingRef.current = {
          resolve,
          reject,
          timeout: setTimeout(() => {
            worker.postMessage("stop");
            rejectPending("Engine move timed out");
            restartWorker();
          }, thinkTime + 7000),
        };

        worker.postMessage(`position fen ${fen}`);
        worker.postMessage(`go movetime ${thinkTime}`);
      });
    },
    [clearPending, rejectPending],
  );

  return { isReady, isThinking, getBestMove };
}
