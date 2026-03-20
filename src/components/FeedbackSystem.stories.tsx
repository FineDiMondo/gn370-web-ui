// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import {
  FeedbackSystem,
  Loading,
  Success,
  Error,
  Warning,
  Info,
} from './FeedbackSystem';

const meta = {
  title: 'GN370/FeedbackSystem',
  component: FeedbackSystem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['loading', 'success', 'error', 'warning', 'info'],
    },
    autoDismiss: {
      control: { type: 'number' },
    },
  },
} satisfies Meta<typeof FeedbackSystem>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ===== Loading States ===== */

export const Loading_Default: Story = {
  render: () => (
    <Loading
      message="Caricamento albero genealogico in corso..."
      description="Elaborazione di 1250 persone e 1100 relazioni"
    />
  ),
};

export const Loading_Simple: Story = {
  render: () => <Loading message="Elaborazione dei dati..." />,
};

export const Loading_WithCancel: Story = {
  render: () => (
    <Loading
      message="Importazione GEDCOM in corso..."
      description="Analisi file: personas-giardina-2024.ged"
      onCancel={() => alert('Import cancelled')}
    />
  ),
};

/* ===== Success States ===== */

export const Success_Default: Story = {
  render: () => (
    <Success
      message="Albero genealogico caricato con successo!"
      description="1250 persone e 1100 relazioni caricate in 2.34 secondi"
    />
  ),
};

export const Success_Simple: Story = {
  render: () => <Success message="Operazione completata con successo!" />,
};

export const Success_WithAction: Story = {
  render: () => (
    <Success
      message="GEDCOM importato correttamente"
      description="15,234 persone aggiunte al database"
      action={{
        label: 'Visualizza',
        onClick: () => alert('Viewing imported data'),
      }}
    />
  ),
};

/* ===== Error States ===== */

export const Error_Default: Story = {
  render: () => (
    <Error
      message="Errore nel caricamento dell'albero genealogico"
      description="Nessuna connessione al server. Verifica la tua connessione internet."
    />
  ),
};

export const Error_Simple: Story = {
  render: () => <Error message="Si è verificato un errore" />,
};

export const Error_WithRetry: Story = {
  render: () => (
    <Error
      message="Impossibile importare il file GEDCOM"
      description="Il file selezionato non è valido o è corrotto (File size: 0 bytes)"
      onRetry={() => alert('Retry import')}
    />
  ),
};

export const Error_NotFound: Story = {
  render: () => (
    <Error
      message="Persona non trovata"
      description="La persona con ID 'person-999999' non esiste nel database"
    />
  ),
};

/* ===== Warning States ===== */

export const Warning_Default: Story = {
  render: () => (
    <Warning
      message="Attenzione: Operazione in corso"
      description="I tuoi dati genealogici stanno per essere aggiornati. Questo potrebbe richiedere qualche minuto."
    />
  ),
};

export const Warning_Simple: Story = {
  render: () => <Warning message="Verifica i tuoi dati prima di procedere" />,
};

export const Warning_WithAction: Story = {
  render: () => (
    <Warning
      message="Molti duplicati rilevati"
      description="Sono state trovate 45 possibili duplicate nella famiglia. Vuoi rivederle?"
      action={{
        label: 'Rivedi',
        onClick: () => alert('Review duplicates'),
      }}
    />
  ),
};

/* ===== Info States ===== */

export const Info_Default: Story = {
  render: () => (
    <Info
      message="Suggerimento"
      description="Usa le frecce per navigare l'albero genealogico. Premi 'Export' per scaricare i dati."
    />
  ),
};

export const Info_Simple: Story = {
  render: () => <Info message="Questa è una novità introdotta in questa versione" />,
};

export const Info_WithAction: Story = {
  render: () => (
    <Info
      message="Nuova funzionalità: Esportazione in PDF"
      description="Ora puoi esportare l'intero albero genealogico in un singolo file PDF."
      action={{
        label: 'Scopri di più',
        onClick: () => alert('Learn more about PDF export'),
      }}
    />
  ),
};

/* ===== All States Grid ===== */

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', background: '#000000', padding: '24px' }}>
      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Loading</h3>
        <Loading message="Caricamento in corso..." />
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Success</h3>
        <Success message="Operazione completata!" />
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Error</h3>
        <Error message="Si è verificato un errore" />
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Warning</h3>
        <Warning message="Attenzione: Azione importante" />
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Info</h3>
        <Info message="Informazione utile" />
      </div>
    </div>
  ),
};

/* ===== Mobile Viewport ===== */

export const Mobile: Story = {
  render: () => (
    <div style={{ width: '375px', background: '#000000', padding: '12px' }}>
      <Success
        message="Caricamento completato"
        description="1250 persone caricate correttamente"
      />
    </div>
  ),
};

/* ===== Tablet Viewport ===== */

export const Tablet: Story = {
  render: () => (
    <div style={{ width: '768px', background: '#000000', padding: '16px' }}>
      <Error
        message="Errore di connessione"
        description="Impossibile connettersi al server. Riprova tra pochi istanti."
        onRetry={() => alert('Retry')}
      />
    </div>
  ),
};

/* ===== With Long Content ===== */

export const LongContent: Story = {
  render: () => (
    <Error
      message="Errore di validazione GEDCOM"
      description={
        'Il file contiene i seguenti errori di validazione:\n' +
        '1. Riga 245: Data di nascita non valida (formato DD/MM/YYYY atteso)\n' +
        '2. Riga 312: Relazione genitore-figlio non valida\n' +
        '3. Riga 467: ID persona duplicato rilevato\n\n' +
        'Correggi questi errori e riprova l\'importazione.'
      }
      onRetry={() => alert('Retry')}
    />
  ),
};

/* ===== Accessibility Testing ===== */

export const Accessibility: Story = {
  render: () => (
    <div style={{ background: '#000000', padding: '24px', display: 'grid', gap: '16px' }}>
      <div>
        <h2 style={{ color: '#FFFFFF', marginBottom: '16px' }}>Accessibility Features</h2>
        <ul style={{ color: '#A8B5C8', lineHeight: '1.8' }}>
          <li>✅ ARIA live regions (status/assertive)</li>
          <li>✅ Semantic HTML structure</li>
          <li>✅ Keyboard dismissible (ESC key)</li>
          <li>✅ Focus management</li>
          <li>✅ Color contrast verified</li>
          <li>✅ Screen reader friendly</li>
          <li>✅ Reduced motion support</li>
          <li>✅ High contrast mode support</li>
        </ul>
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Live Region Example:</h3>
        <Error message="Press ESC to dismiss this message" />
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Touch Target Example:</h3>
        <Success
          message="Action button has 44px+ touch target"
          action={{
            label: 'Touch Target (44px)',
            onClick: () => alert('Touched'),
          }}
        />
      </div>
    </div>
  ),
};

/* ===== Auto Dismiss Example ===== */

export const AutoDismiss: Story = {
  render: () => (
    <div style={{ background: '#000000', padding: '24px', display: 'grid', gap: '16px' }}>
      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>
          Auto-dismiss after 5 seconds (Success):
        </h3>
        <Success
          message="Dati salvati automaticamente"
          autoDismiss={5000}
          onDismiss={() => console.log('Dismissed')}
        />
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>
          No auto-dismiss (Error):
        </h3>
        <Error
          message="Errore critico - Richiede azione"
          autoDismiss={null}
        />
      </div>

      <div>
        <h3 style={{ color: '#FFFFFF', marginBottom: '8px' }}>
          Auto-dismiss after 10 seconds (Warning):
        </h3>
        <Warning
          message="Avviso temporaneo"
          autoDismiss={10000}
        />
      </div>
    </div>
  ),
};

/* ===== Dark Mode Variations ===== */

export const DarkMode: Story = {
  render: () => (
    <div style={{ background: '#000000', padding: '24px', display: 'grid', gap: '16px' }}>
      <Loading message="Caricamento dei dati..." />
      <Success message="Operazione completata" />
      <Error message="Si è verificato un errore" />
      <Warning message="Attenzione" />
      <Info message="Informazione" />
    </div>
  ),
};
