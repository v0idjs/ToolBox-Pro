import { useState } from 'react';
import { FolderOpen, Scissors, Save, Zap } from 'lucide-react';
import { useThemeColors } from '@/lib/theme';

type SplitMode = 'lines' | 'size' | 'parts';

interface ChunkResult {
  index: number;
  lines: number;
  sizeKB: number;
}

export function FileSplitter() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('lines');
  const [linesPerChunk, setLinesPerChunk] = useState(1000);
  const [kbPerChunk, setKbPerChunk] = useState(500);
  const [numParts, setNumParts] = useState(2);
  const [results, setResults] = useState<ChunkResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const colors = useThemeColors();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  };

  const handleOpenFile = async () => {
    try {
      const result = await window.api.openFile();
      if (result) {
        setFileName(result.name);
        setFileContent(result.content);
        setFileSize(result.size);
        setResults([]);
      }
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleSplit = async () => {
    if (!fileContent || !fileName) return;
    setProcessing(true);
    setResults([]);

    try {
      const lines = fileContent.split(/\r?\n/);
      const chunks: ChunkResult[] = [];
      let chunkIndex = 0;

      if (splitMode === 'lines') {
        const chunkSize = Math.max(1, linesPerChunk);
        for (let i = 0; i < lines.length; i += chunkSize) {
          const chunkLines = lines.slice(i, i + chunkSize);
          const chunkContent = chunkLines.join('\n');
          const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`;
          await window.api.saveFile(chunkFileName, chunkContent);
          chunks.push({
            index: chunkIndex + 1,
            lines: chunkLines.length,
            sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
          });
          chunkIndex++;
        }
      } else if (splitMode === 'parts') {
        const parts = Math.max(2, Math.min(100, numParts));
        const linesPerPart = Math.ceil(lines.length / parts);
        for (let i = 0; i < lines.length; i += linesPerPart) {
          const chunkLines = lines.slice(i, i + linesPerPart);
          const chunkContent = chunkLines.join('\n');
          const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`;
          await window.api.saveFile(chunkFileName, chunkContent);
          chunks.push({
            index: chunkIndex + 1,
            lines: chunkLines.length,
            sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
          });
          chunkIndex++;
        }
      } else {
        const maxBytes = Math.max(1, kbPerChunk) * 1024;
        let currentChunk: string[] = [];
        let currentSize = 0;
        for (const line of lines) {
          const lineBytes = new Blob([line + '\n']).size;
          if (currentSize + lineBytes > maxBytes && currentChunk.length > 0) {
            const chunkContent = currentChunk.join('\n');
            const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`;
            await window.api.saveFile(chunkFileName, chunkContent);
            chunks.push({
              index: chunkIndex + 1,
              lines: currentChunk.length,
              sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
            });
            chunkIndex++;
            currentChunk = [];
            currentSize = 0;
          }
          currentChunk.push(line);
          currentSize += lineBytes;
        }
        if (currentChunk.length > 0) {
          const chunkContent = currentChunk.join('\n');
          const chunkFileName = `${fileName.replace(/\.[^.]+$/, '')}_part${chunkIndex + 1}.txt`;
          await window.api.saveFile(chunkFileName, chunkContent);
          chunks.push({
            index: chunkIndex + 1,
            lines: currentChunk.length,
            sizeKB: parseFloat((new Blob([chunkContent]).size / 1024).toFixed(2)),
          });
        }
      }

      setResults(chunks);
    } catch (err) {
      console.error('Failed to split file:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ color: colors.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Scissors size={28} color={colors.accent} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>File Splitter</h1>
      </div>
      <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, marginBottom: 32 }}>
        Split large files into smaller chunks by line count, file size, or number of parts
      </p>

      <button
        onClick={handleOpenFile}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 28px',
          backgroundColor: colors.accent,
          color: colors.text,
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: 32,
        }}
      >
        <FolderOpen size={16} />
        Open File
      </button>

      {fileName && (
        <div
          style={{
            backgroundColor: colors.input,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 15, color: colors.text, fontWeight: 500 }}>{fileName}</div>
          <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{formatBytes(fileSize)}</div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Split Mode</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['lines', 'size', 'parts'] as SplitMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSplitMode(mode)}
              style={{
                padding: '10px 20px',
                backgroundColor: splitMode === mode ? colors.accent : colors.input,
                color: splitMode === mode ? colors.text : colors.textSecondary,
                border: `1px solid ${splitMode === mode ? colors.accent : colors.border}`,
                borderRadius: 8,
                fontSize: 15,
                cursor: 'pointer',
                fontWeight: splitMode === mode ? 500 : 400,
              }}
            >
              {mode === 'lines' ? 'By Line Count' : mode === 'size' ? 'By File Size (KB)' : 'By Parts'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 10 }}>
          {splitMode === 'lines' ? 'Lines per chunk' : splitMode === 'size' ? 'KB per chunk' : 'Number of parts'}
        </label>
        <input
          type="number"
          min={splitMode === 'parts' ? 2 : 1}
          max={splitMode === 'parts' ? 100 : undefined}
          value={splitMode === 'lines' ? linesPerChunk : splitMode === 'size' ? kbPerChunk : numParts}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10) || 1;
            if (splitMode === 'lines') setLinesPerChunk(val);
            else if (splitMode === 'size') setKbPerChunk(val);
            else setNumParts(Math.max(2, Math.min(100, val)));
          }}
          style={{
            width: '100%',
            padding: 14,
            backgroundColor: colors.input,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            fontSize: 15,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleSplit}
        disabled={!fileContent || processing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 28px',
          backgroundColor: !fileContent || processing ? colors.input : colors.accent,
          color: !fileContent || processing ? colors.textSecondary : colors.text,
          border: 'none',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 500,
          cursor: !fileContent || processing ? 'not-allowed' : 'pointer',
          marginBottom: 32,
        }}
      >
        <Zap size={16} />
        {processing ? 'Splitting...' : 'Split File'}
      </button>

      {results.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
              Results ({results.length} chunk{results.length !== 1 ? 's' : ''} created)
            </label>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 16,
              backgroundColor: colors.input,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
            }}
          >
            {results.map((chunk) => (
              <div
                key={chunk.index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 15,
                }}
              >
                <span style={{ color: colors.text, fontWeight: 500 }}>Part {chunk.index}</span>
                <span style={{ color: colors.textSecondary }}>
                  {chunk.lines} lines · {chunk.sizeKB} KB
                </span>
                <Save size={14} color={colors.textSecondary} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 13, color: colors.textSecondary }}>
            <span>Total: {results.length} parts</span>
            <span>|</span>
            <span>{results.reduce((a, c) => a + c.lines, 0).toLocaleString()} lines</span>
            <span>|</span>
            <span>{results.reduce((a, c) => a + c.sizeKB, 0).toFixed(2)} KB</span>
          </div>
        </div>
      )}
    </div>
  );
}
