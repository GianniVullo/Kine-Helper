<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import EditorJS from '@editorjs/editorjs';
  import Header from '@editorjs/header';
  import List from '@editorjs/list';
  import Checklist from '@editorjs/checklist';
  import Quote from '@editorjs/quote';
  import Warning from '@editorjs/warning';
  import Table from '@editorjs/table';
  import Delimiter from '@editorjs/delimiter';
  import InlineCode from '@editorjs/inline-code';
  import Marker from '@editorjs/marker';
  import Underline from '@editorjs/underline';

  // Props
  let {
    onSave = null,
    onCancel = null
  } = $props();

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // State
  let editor = $state(null);
  let editorHolder = $state(null);
  let templateName = $state('');
  let templateIcon = $state('📝');
  let templateKey = $state('');
  let isSubmitting = $state(false);
  let errors = $state({
    name: '',
    key: '',
    content: ''
  });

  // Available icons for templates
  const availableIcons = [
    '📝', '📋', '📊', '🏥', '💊', '🦴', '🧠', '❤️', '🫁', '👁️', 
    '🦷', '👂', '🤲', '🦵', '🦶', '🏃', '🚶', '🧘', '💪', '🛏️',
    '📐', '🔬', '💉', '🩺', '🌡️', '⚡', '🎯', '📈', '📉', '✅'
  ];

  // Initialize EditorJS
  onMount(() => {
    if (!editorHolder) return;

    editor = new EditorJS({
      holder: editorHolder,
      placeholder: 'Build your template here... Use various blocks to create a reusable structure.',
      autofocus: true,
      minHeight: 200,
      
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4],
            defaultLevel: 3
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true,
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote\'s author',
          }
        },
        warning: {
          class: Warning,
          inlineToolbar: true,
          config: {
            titlePlaceholder: 'Title',
            messagePlaceholder: 'Message',
          }
        },
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3,
            withHeadings: true
          }
        },
        delimiter: Delimiter,
        inlineCode: {
          class: InlineCode
        },
        marker: {
          class: Marker
        },
        underline: {
          class: Underline
        }
      }
    });
  });

  // Cleanup
  onDestroy(async () => {
    if (editor) {
      try {
        await editor.isReady;
        editor.destroy();
        editor = null;
      } catch (error) {
        console.error('Error during template editor cleanup:', error);
      }
    }
    editorHolder = null;
  });

  // Generate template key from name
  function generateKey(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Auto-generate key when name changes
  $effect(() => {
    if (templateName && !templateKey) {
      templateKey = generateKey(templateName);
    }
  });

  // Validate form
  function validateForm() {
    let isValid = true;
    errors = { name: '', key: '', content: '' };

    if (!templateName.trim()) {
      errors.name = 'Template name is required';
      isValid = false;
    }

    if (!templateKey.trim()) {
      errors.key = 'Template key is required';
      isValid = false;
    } else if (!/^[a-z][a-z0-9_]*$/.test(templateKey)) {
      errors.key = 'Key must start with a letter and contain only lowercase letters, numbers, and underscores';
      isValid = false;
    }

    return isValid;
  }

  // Handle save
  async function handleSave() {
    if (!validateForm()) return;
    if (!editor) return;

    isSubmitting = true;
    
    try {
      const editorData = await editor.save();
      
      if (!editorData.blocks || editorData.blocks.length === 0) {
        errors.content = 'Template must contain at least one block';
        isSubmitting = false;
        return;
      }

      // Create template object
      const template = {
        key: templateKey,
        name: templateName,
        icon: templateIcon,
        blocks: editorData.blocks
      };

      // Call the onSave callback or dispatch event
      if (onSave) {
        await onSave(template);
      }
      
      dispatch('save', template);
      
      // Reset form
      templateName = '';
      templateKey = '';
      templateIcon = '📝';
      await editor.clear();
      
    } catch (error) {
      console.error('Error saving template:', error);
      errors.content = 'Failed to save template. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  // Handle cancel
  function handleCancel() {
    if (onCancel) {
      onCancel();
    }
    dispatch('cancel');
  }

  // Handle icon selection
  function selectIcon(icon) {
    templateIcon = icon;
  }
</script>

<div class="template-creator-modal">
  <div class="modal-header">
    <h2>Create New Template</h2>
    <button class="close-btn" onclick={handleCancel} aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <div class="modal-body">
    <!-- Template metadata form -->
    <div class="template-metadata">
      <div class="form-row">
        <div class="form-group flex-grow">
          <label for="template-name">
            Template Name <span class="required">*</span>
          </label>
          <input
            id="template-name"
            type="text"
            bind:value={templateName}
            placeholder="e.g., Sleep Quality Assessment"
            class:error={errors.name}
          />
          {#if errors.name}
            <span class="error-message">{errors.name}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="template-key">
            Template Key <span class="required">*</span>
          </label>
          <input
            id="template-key"
            type="text"
            bind:value={templateKey}
            placeholder="e.g., sleep_quality"
            class:error={errors.key}
          />
          {#if errors.key}
            <span class="error-message">{errors.key}</span>
          {/if}
        </div>
      </div>

      <div class="form-group">
        <label>Select Icon</label>
        <div class="icon-grid">
          {#each availableIcons as icon}
            <button
              type="button"
              class="icon-option"
              class:selected={templateIcon === icon}
              onclick={() => selectIcon(icon)}
              aria-label="Select {icon} icon"
            >
              {icon}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Template content editor -->
    <div class="template-content">
      <label class="content-label">
        Template Content <span class="required">*</span>
      </label>
      <div class="editor-instructions">
        <p>💡 <strong>Tips for creating templates:</strong></p>
        <ul>
          <li>Use <code>___</code> (three underscores) as placeholders for values to be filled in</li>
          <li>Add headers to organize sections</li>
          <li>Use checklists for common assessment points</li>
          <li>Include tables for structured data entry</li>
          <li>Keep templates focused on a single assessment type</li>
        </ul>
      </div>
      
      <div class="template-editor-container" bind:this={editorHolder}></div>
      
      {#if errors.content}
        <span class="error-message">{errors.content}</span>
      {/if}
    </div>
  </div>

  <div class="modal-footer">
    <button 
      class="btn btn-secondary" 
      onclick={handleCancel}
      disabled={isSubmitting}
    >
      Cancel
    </button>
    <button 
      class="btn btn-primary" 
      onclick={handleSave}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Creating...' : 'Create Template'}
    </button>
  </div>
</div>

<style>
  .template-creator-modal {
    background: white;
    border-radius: 12px;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 30px;
    border-bottom: 1px solid #e8e8e8;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f5f5f5;
    color: #333;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
  }

  .template-metadata {
    margin-bottom: 30px;
  }

  .form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group.flex-grow {
    flex: 1;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  .required {
    color: #e74c3c;
  }

  .form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  .form-group input.error {
    border-color: #e74c3c;
  }

  .error-message {
    display: block;
    color: #e74c3c;
    font-size: 12px;
    margin-top: 4px;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 8px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
  }

  .icon-option {
    width: 40px;
    height: 40px;
    border: 2px solid transparent;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 20px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-option:hover {
    transform: scale(1.1);
    border-color: #4a90e2;
  }

  .icon-option.selected {
    background: #4a90e2;
    border-color: #4a90e2;
    box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
  }

  .template-content {
    margin-top: 20px;
  }

  .content-label {
    display: block;
    margin-bottom: 12px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  .editor-instructions {
    background: #f0f7ff;
    border: 1px solid #b3d9ff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .editor-instructions p {
    margin: 0 0 8px 0;
    color: #0066cc;
    font-size: 14px;
  }

  .editor-instructions ul {
    margin: 0;
    padding-left: 20px;
  }

  .editor-instructions li {
    color: #333;
    font-size: 13px;
    margin: 4px 0;
  }

  .editor-instructions code {
    background: white;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
  }

  .template-editor-container {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    min-height: 300px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 30px;
    border-top: 1px solid #e8e8e8;
    background: #fafafa;
  }

  .btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    outline: none;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #4a90e2;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #357abd;
  }

  .btn-secondary {
    background: #e8e8e8;
    color: #333;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #d0d0d0;
  }

  /* EditorJS specific styles within modal */
  :global(.template-editor-container .ce-block__content) {
    max-width: 100%;
  }

  :global(.template-editor-container .ce-toolbar__content) {
    max-width: 100%;
  }

  :global(.template-editor-container .cdx-block) {
    max-width: 100%;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .template-creator-modal {
      max-width: 95%;
      margin: 10px;
    }

    .form-row {
      flex-direction: column;
      gap: 0;
    }

    .icon-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }
</style>