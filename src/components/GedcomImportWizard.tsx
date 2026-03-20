import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Loader } from 'lucide-react';
import './GedcomImportWizard.module.css';

export type ImportStep = 'select' | 'validate' | 'preview' | 'progress' | 'success' | 'error';

interface ImportProgress {
  step: string;
  current: number;
  total: number;
  percentage: number;
}

interface ImportResult {
  personCount: number;
  familyCount: number;
  relationCount: number;
  warnings: string[];
}

interface GedcomImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: ImportResult) => void;
}

/**
 * Multi-step GEDCOM import wizard
 *
 * Step 1: File Selection (drag-drop + file picker)
 * Step 2: Validation (live GEDCOM parsing)
 * Step 3: Preview (show what will be imported)
 * Step 4: Progress (import progress bar)
 * Step 5: Success/Error
 */
export const GedcomImportWizard: React.FC<GedcomImportWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('select');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<{
    personCount: number;
    familyCount: number;
    relationCount: number;
    samplePersons: Array<{ name: string; birthDate?: string }>;
  } | null>(null);
  const [progress, setProgress] = useState<ImportProgress>({
    step: 'Inizializzazione...',
    current: 0,
    total: 100,
    percentage: 0,
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard support: ESC to close, Enter to confirm
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        // Auto-focus primary button and trigger
        const primaryBtn = document.querySelector('.button--primary') as HTMLButtonElement;
        if (primaryBtn && !primaryBtn.disabled) {
          primaryBtn.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file extension
    if (!selectedFile.name.endsWith('.ged')) {
      setErrorMessage('❌ File non valido. Carica un file .ged');
      return;
    }

    // Validate file size (max 50MB)
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setErrorMessage(`❌ File troppo grande (${fileSizeMB.toFixed(1)}MB). Max 50MB`);
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
    // Move to validation step after 500ms
    setTimeout(() => validateFile(selectedFile), 500);
  };

  const validateFile = async (selectedFile: File) => {
    setCurrentStep('validate');
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      // Simulate GEDCOM parsing (in real app, this would be backend)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fileContent = await selectedFile.text();
      const lines = fileContent.split('\n');

      // Enhanced GEDCOM validation
      const errors: string[] = [];
      const warnings: string[] = [];
      let personCount = 0;
      let familyCount = 0;
      let relationCount = 0;
      const samplePersons: Array<{ name: string; birthDate?: string }> = [];

      // Check for GEDCOM header
      const hasHeader = lines.some((l) => l.trim().includes('0 HEAD'));
      if (!hasHeader) {
        errors.push('❌ File non sembra essere un GEDCOM valido (manca intestazione 0 HEAD)');
      }

      const hasTrailer = lines.some((l) => l.trim().includes('0 TRLR'));
      if (!hasTrailer) {
        warnings.push('⚠️ File manca il trailer (0 TRLR) - potrebbero esserci dati incompleti');
      }

      let currentIndi: { id?: string; name?: string; birthDate?: string } = {};
      let indiWithoutName = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s+/);
        const tag = parts[1];

        if (tag === 'INDI') {
          personCount++;
          currentIndi = { id: parts[0] };
        } else if (tag === 'NAME' && personCount > 0) {
          currentIndi.name = line.substring(line.indexOf('NAME') + 5).trim();
          if (samplePersons.length < 5) {
            samplePersons.push({ ...currentIndi });
          }
        } else if (tag === 'BIRT') {
          currentIndi.birthDate = line.substring(line.indexOf('BIRT') + 5).trim();
        } else if (!currentIndi.name && tag !== 'INDI') {
          // Track INDI without name
          if (tag === 'FAMC' || tag === 'FAMS') {
            indiWithoutName++;
          }
        } else if (tag === 'FAM') {
          familyCount++;
        } else if (tag === 'FAMC' || tag === 'FAMS') {
          relationCount++;
        }
      }

      // Validation checks
      if (personCount === 0) {
        errors.push('❌ Nessuna persona trovata nel GEDCOM');
      } else if (personCount === 1) {
        warnings.push('⚠️ GEDCOM contiene solo 1 persona - genealogia incompleta');
      }

      if (familyCount === 0 && personCount > 1) {
        warnings.push('⚠️ Nessuna famiglia trovata - relazioni potrebbero mancare');
      }

      if (indiWithoutName > 0) {
        warnings.push(`⚠️ ${indiWithoutName} person${indiWithoutName !== 1 ? 'e' : 'a'} senza nome`);
      }

      setValidationErrors(errors);
      setValidationWarnings(warnings);

      if (errors.length === 0) {
        // Move to preview
        setPreviewData({
          personCount,
          familyCount,
          relationCount,
          samplePersons,
        });
        setCurrentStep('preview');
      } else {
        // Show errors but allow continue anyway
        setCurrentStep('preview');
        setPreviewData({
          personCount,
          familyCount,
          relationCount,
          samplePersons,
        });
      }
    } catch (error) {
      setErrorMessage(`❌ Errore parsing GEDCOM: ${error instanceof Error ? error.message : String(error)}`);
      setCurrentStep('error');
    }
  };

  const handleStartImport = async () => {
    if (!file) return;

    setCurrentStep('progress');
    setProgress({ step: 'Caricamento...', current: 0, total: 100, percentage: 0 });

    try {
      // Simulate import progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setProgress({
          step:
            i < 30
              ? `Caricamento PERSON (${Math.floor(i / 0.3)}/366)...`
              : i < 70
                ? `Caricamento FAMILY (${Math.floor((i - 30) / 0.4)}/177)...`
                : `Caricamento RELATION (${Math.floor((i - 70) / 0.3)}/1118)...`,
          current: i,
          total: 100,
          percentage: i,
        });
      }

      // Mock successful import
      const result: ImportResult = {
        personCount: previewData?.personCount || 0,
        familyCount: previewData?.familyCount || 0,
        relationCount: previewData?.relationCount || 0,
        warnings: validationWarnings,
      };

      setImportResult(result);
      setCurrentStep('success');
      onSuccess?.(result);
    } catch (error) {
      setErrorMessage(`❌ Errore durante import: ${error}`);
      setCurrentStep('error');
    }
  };

  return (
    <div className="gedcom-wizard-overlay" role="presentation">
      <div
        className="gedcom-wizard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
        aria-describedby="wizard-description"
      >
        {/* Header */}
        <div className="gedcom-wizard__header">
          <h2 id="wizard-title">Carica GEDCOM</h2>
          <p id="wizard-description" style={{ display: 'none' }}>
            Wizard multi-step per importare file genealogici GEDCOM
          </p>
          <button
            className="gedcom-wizard__close"
            onClick={onClose}
            aria-label="Chiudi modal"
          >
            ×
          </button>
        </div>

        {/* Step Indicator */}
        <div className="gedcom-wizard__steps">
          <div className={`step ${currentStep === 'select' ? 'active' : 'done'}`}>
            1. File
          </div>
          <div className={`step ${currentStep === 'validate' ? 'active' : currentStep !== 'select' ? 'done' : ''}`}>
            2. Valida
          </div>
          <div className={`step ${currentStep === 'preview' ? 'active' : ['progress', 'success'].includes(currentStep) ? 'done' : ''}`}>
            3. Preview
          </div>
          <div className={`step ${currentStep === 'progress' ? 'active' : currentStep === 'success' ? 'done' : ''}`}>
            4. Importa
          </div>
        </div>

        {/* Content */}
        <div className="gedcom-wizard__content">
          {/* STEP 1: Select File */}
          {currentStep === 'select' && (
            <div className="wizard-step">
              <div
                className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={48} strokeWidth={1.5} />
                <h3>Trascina il file GEDCOM qui</h3>
                <p>oppure</p>
                <button
                  className="button button--primary"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Apri file browser per selezionare file GEDCOM"
                >
                  Sfoglia file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ged"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                  aria-label="Seleziona file GEDCOM"
                />
              </div>

              {file && (
                <div className="file-info">
                  <FileText size={24} />
                  <div>
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="alert alert--error" role="alert">
                  {errorMessage}
                </div>
              )}

              <p className="hint">
                ℹ️ Accetta file GEDCOM 5.5.1 o 7.0, max 50MB
              </p>
            </div>
          )}

          {/* STEP 2: Validate */}
          {currentStep === 'validate' && (
            <div className="wizard-step">
              <div className="validating">
                <Loader size={32} className="spinner" />
                <h3>Validazione GEDCOM in corso...</h3>
                <p>Analizzando struttura e dati</p>
              </div>
            </div>
          )}

          {/* STEP 3: Preview */}
          {currentStep === 'preview' && previewData && (
            <div className="wizard-step">
              <h3>Anteprima Dati</h3>

              {validationErrors.length > 0 && (
                <div className="alert alert--error" role="alert">
                  <h4>❌ Errori trovati:</h4>
                  <ul>
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationWarnings.length > 0 && (
                <div className="alert alert--warning" role="alert">
                  <h4>⚠️ Avvertimenti:</h4>
                  <ul>
                    {validationWarnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="preview-stats">
                <div className="stat">
                  <strong>{previewData.personCount}</strong>
                  <span>Persone</span>
                </div>
                <div className="stat">
                  <strong>{previewData.familyCount}</strong>
                  <span>Famiglie</span>
                </div>
                <div className="stat">
                  <strong>{previewData.relationCount}</strong>
                  <span>Relazioni</span>
                </div>
              </div>

              <h4>Primi record</h4>
              <div className="sample-persons">
                {previewData.samplePersons.map((person, i) => (
                  <div key={i} className="sample-person">
                    <p className="name">{person.name || 'N/A'}</p>
                    {person.birthDate && <p className="date">{person.birthDate}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Progress */}
          {currentStep === 'progress' && (
            <div className="wizard-step">
              <div className="import-progress" role="status" aria-live="polite" aria-label="Avanzamento importazione">
                <Loader size={32} className="spinner" />
                <h3>{progress.step}</h3>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <p className="progress-text">{progress.percentage}%</p>
                <p className="progress-estimate">
                  Tempo rimanente: ~{Math.round((100 - progress.percentage) / 10)} secondi
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {currentStep === 'success' && importResult && (
            <div className="wizard-step">
              <div className="success-message">
                <CheckCircle size={48} color="var(--secondary)" />
                <h3>✓ GEDCOM caricato con successo!</h3>
                <div className="success-summary">
                  <p>
                    <strong>{importResult.personCount}</strong> persone
                  </p>
                  <p>
                    <strong>{importResult.familyCount}</strong> famiglie
                  </p>
                  <p>
                    <strong>{importResult.relationCount}</strong> relazioni
                  </p>
                </div>
                {importResult.warnings.length > 0 && (
                  <div className="alert alert--info">
                    <p>
                      ℹ️ {importResult.warnings.length} avvertimento
                      {importResult.warnings.length !== 1 ? 'i' : ''} trovato
                      {importResult.warnings.length !== 1 ? 'i' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ERROR State */}
          {currentStep === 'error' && (
            <div className="wizard-step">
              <div className="error-message">
                <AlertCircle size={48} color="var(--danger)" />
                <h3>❌ Errore durante l'importazione</h3>
                <p>{errorMessage || 'Si è verificato un errore sconosciuto'}</p>
                <p className="error-suggest">Prova a caricare di nuovo il file</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="gedcom-wizard__footer">
          {currentStep === 'select' && (
            <>
              <button className="button button--ghost" onClick={onClose}>
                Annulla
              </button>
              <button
                className="button button--primary"
                onClick={() => {
                  if (file) {
                    validateFile(file);
                  }
                }}
                disabled={!file}
                aria-label="Procedi al passo successivo per validare il file GEDCOM"
              >
                Avanti
              </button>
            </>
          )}

          {currentStep === 'preview' && (
            <>
              <button
                className="button button--ghost"
                onClick={() => setCurrentStep('select')}
              >
                ← Indietro
              </button>
              <button
                className="button button--primary"
                onClick={handleStartImport}
                aria-label="Avvia l'importazione dei dati GEDCOM"
              >
                Importa Dati
              </button>
            </>
          )}

          {currentStep === 'success' && (
            <button
              className="button button--primary"
              onClick={onClose}
              aria-label="Chiudi il wizard e inizia a esplorare l'albero genealogico"
            >
              Inizia Esplorazione
            </button>
          )}

          {currentStep === 'error' && (
            <>
              <button className="button button--ghost" onClick={onClose}>
                Annulla
              </button>
              <button
                className="button button--primary"
                onClick={() => setCurrentStep('select')}
              >
                Carica di Nuovo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GedcomImportWizard;
