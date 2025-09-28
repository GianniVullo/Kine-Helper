/**
 * Template Blocks Plugin for EditorJS
 * Allows insertion of predefined content templates for medical documentation
 */

class TemplateBlocks {
  constructor({ data, api, config }) {
    this.api = api;
    this.config = config || {};
    this.data = data || {};
    
    // Default templates for kinesitherapists
    this.templates = this.config.templates || this.getDefaultTemplates();
    
    // UI elements
    this.wrapper = null;
    this.templateSelector = null;
    
    // Store bound event handlers for cleanup
    this.boundHandlers = {
      insertTemplate: null,
      selectorChange: null
    };
  }

  /**
   * Tool's icon in the toolbar
   */
  static get toolbox() {
    return {
      title: 'Templates',
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm2 0v3h3V4H4zm5 0v3h3V4H9zm5 0v3h3V4h-3zM4 9v3h3V9H4zm5 0v3h3V9H9zm5 0v3h3V9h-3zM4 14v2h3v-2H4zm5 0v2h3v-2H9zm5 0v2h3v-2h-3z" fill="currentColor"/></svg>'
    };
  }

  /**
   * Render the tool's UI
   */
  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('template-blocks-wrapper');
    
    // Create template selector
    const selectorContainer = document.createElement('div');
    selectorContainer.classList.add('template-selector-container');
    
    const label = document.createElement('label');
    label.textContent = 'Select a template to insert:';
    label.classList.add('template-label');
    
    this.templateSelector = document.createElement('select');
    this.templateSelector.classList.add('template-selector');
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Choose a template --';
    this.templateSelector.appendChild(defaultOption);
    
    // Add template options
    Object.keys(this.templates).forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${this.templates[key].icon} ${this.templates[key].name}`;
      this.templateSelector.appendChild(option);
    });
    
    // Insert button
    const insertButton = document.createElement('button');
    insertButton.textContent = 'Insert Template';
    insertButton.classList.add('template-insert-button');
    
    // Bind event handlers
    this.boundHandlers.insertTemplate = () => this.insertTemplate();
    insertButton.addEventListener('click', this.boundHandlers.insertTemplate);
    
    // Preview area
    const previewArea = document.createElement('div');
    previewArea.classList.add('template-preview');
    previewArea.innerHTML = '<p class="preview-hint">Select a template to see preview</p>';
    
    // Update preview on selection change
    this.boundHandlers.selectorChange = (e) => {
      if (e.target.value) {
        const template = this.templates[e.target.value];
        previewArea.innerHTML = this.generatePreview(template);
      } else {
        previewArea.innerHTML = '<p class="preview-hint">Select a template to see preview</p>';
      }
    };
    this.templateSelector.addEventListener('change', this.boundHandlers.selectorChange);
    
    selectorContainer.appendChild(label);
    selectorContainer.appendChild(this.templateSelector);
    selectorContainer.appendChild(insertButton);
    
    this.wrapper.appendChild(selectorContainer);
    this.wrapper.appendChild(previewArea);
    
    return this.wrapper;
  }

  /**
   * Generate preview HTML for a template
   */
  generatePreview(template) {
    let previewHtml = '<div class="preview-content">';
    previewHtml += `<h4>${template.icon} ${template.name}</h4>`;
    previewHtml += '<div class="preview-blocks">';
    
    template.blocks.forEach(block => {
      switch(block.type) {
        case 'header':
          const level = block.data.level || 3;
          previewHtml += `<h${level} class="preview-header">${block.data.text}</h${level}>`;
          break;
        case 'paragraph':
          previewHtml += `<p class="preview-paragraph">${block.data.text}</p>`;
          break;
        case 'checklist':
          previewHtml += '<ul class="preview-checklist">';
          block.data.items.forEach(item => {
            previewHtml += `<li>${item.text}</li>`;
          });
          previewHtml += '</ul>';
          break;
        case 'list':
          const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
          previewHtml += `<${tag} class="preview-list">`;
          block.data.items.forEach(item => {
            previewHtml += `<li>${item}</li>`;
          });
          previewHtml += `</${tag}>`;
          break;
        case 'table':
          previewHtml += '<p class="preview-table-hint">[Table with ROM measurements]</p>';
          break;
      }
    });
    
    previewHtml += '</div></div>';
    return previewHtml;
  }

  /**
   * Insert selected template
   */
  async insertTemplate() {
    const selectedKey = this.templateSelector.value;
    
    if (!selectedKey) {
      alert('Please select a template first');
      return;
    }
    
    const template = this.templates[selectedKey];
    const currentIndex = this.api.blocks.getCurrentBlockIndex();
    
    // Insert all blocks from the template
    for (let i = 0; i < template.blocks.length; i++) {
      const block = template.blocks[i];
      await this.api.blocks.insert(
        block.type,
        block.data,
        {},
        currentIndex + i + 1,
        true
      );
    }
    
    // Remove the template selector block itself
    this.api.blocks.delete(currentIndex);
  }

  /**
   * Save method - not needed for this tool
   */
  save() {
    return {};
  }

  /**
   * Destroy method - cleanup event listeners
   */
  destroy() {
    // Remove event listeners if they exist
    if (this.templateSelector && this.boundHandlers.selectorChange) {
      this.templateSelector.removeEventListener('change', this.boundHandlers.selectorChange);
    }
    
    // Find and remove click listener from button
    const insertButton = this.wrapper?.querySelector('.template-insert-button');
    if (insertButton && this.boundHandlers.insertTemplate) {
      insertButton.removeEventListener('click', this.boundHandlers.insertTemplate);
    }
    
    // Clear references
    this.boundHandlers.insertTemplate = null;
    this.boundHandlers.selectorChange = null;
    this.wrapper = null;
    this.templateSelector = null;
  }

  /**
   * Tool's styles
   */
  static get styles() {
    return `
      .template-blocks-wrapper {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 2px dashed #dee2e6;
      }
      
      .template-selector-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .template-label {
        font-weight: 600;
        color: #495057;
        font-size: 14px;
      }
      
      .template-selector {
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        cursor: pointer;
      }
      
      .template-selector:focus {
        outline: none;
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
      }
      
      .template-insert-button {
        padding: 10px 20px;
        background: #4a90e2;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .template-insert-button:hover {
        background: #357abd;
      }
      
      .template-preview {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 16px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .preview-hint {
        color: #6c757d;
        font-style: italic;
        text-align: center;
        margin: 0;
      }
      
      .preview-content h4 {
        margin: 0 0 12px 0;
        color: #495057;
        font-size: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #dee2e6;
      }
      
      .preview-blocks {
        font-size: 13px;
        color: #6c757d;
      }
      
      .preview-header {
        margin: 8px 0;
        color: #495057;
        font-size: 14px;
      }
      
      .preview-paragraph {
        margin: 6px 0;
        line-height: 1.4;
      }
      
      .preview-checklist,
      .preview-list {
        margin: 8px 0;
        padding-left: 20px;
      }
      
      .preview-checklist li,
      .preview-list li {
        margin: 4px 0;
      }
      
      .preview-table-hint {
        background: #f8f9fa;
        padding: 8px;
        border-radius: 4px;
        font-style: italic;
        margin: 8px 0;
      }
    `;
  }
}

// Add styles to document if not already present
if (!document.getElementById('template-blocks-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'template-blocks-styles';
  styleElement.textContent = TemplateBlocks.styles;
  document.head.appendChild(styleElement);
}

export default TemplateBlocks;