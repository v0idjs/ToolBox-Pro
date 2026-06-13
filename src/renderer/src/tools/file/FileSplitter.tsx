import { useState } from 'react';
import { FolderOpen, Scissors, Save } from 'lucide-react';
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
      <div
        style={{
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scissors size={20} />
          File Splitter
        </h2>

        <button
          onClick={handleOpenFile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: colors.accent,
            color: colors.text,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '20px',
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
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '14px', color: colors.text, fontWeight: 500 }}>{fileName}</div>
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>{formatBytes(fileSize)}</div>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>Split Mode</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['lines', 'size', 'parts'] as SplitMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSplitMode(mode)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: splitMode === mode ? colors.accent : colors.border,
                  color: colors.text,
                  border: '1px solid',
                  borderColor: splitMode === mode ? colors.accent : colors.border,
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {mode === 'lines' ? 'By Line Count' : mode === 'size' ? 'By File Size (KB)' : 'By Parts'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>
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
              padding: '10px 12px',
              backgroundColor: colors.input,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '14px',
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
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: !fileContent || processing ? colors.border : colors.accent,
            color: !fileContent || processing ? colors.textSecondary : colors.text,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: !fileContent || processing ? 'not-allowed' : 'pointer',
            marginBottom: '20px',
          }}
        >
          <Scissors size={16} />
          {processing ? 'Splitting...' : 'Split File'}
        </button>

        {results.length > 0 && (
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: colors.textSecondary }}>
              {results.length} chunk{results.length !== 1 ? 's' : ''} created
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {results.map((chunk) => (
                <div
                  key={chunk.index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: colors.input,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: colors.text }}>Part {chunk.index}</span>
                  <span style={{ color: colors.textSecondary }}>
                    {chunk.lines} lines · {chunk.sizeKB} KB
                  </span>
                  <Save size={14} color={colors.textSecondary} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
