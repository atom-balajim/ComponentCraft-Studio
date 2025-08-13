import React, { useState, useEffect } from "react";
import JSZip from "jszip";

export default function ComponentManager({
  tree,
  onSaveComponent,
  onLoadComponent,
  onDeleteComponent,
  savedComponents,
}) {
  const [componentName, setComponentName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("reactjs");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  console.log("selectedLanguage", selectedLanguage);
  const handleSaveComponent = () => {
    if (!componentName.trim()) {
      alert("Please enter a component name");
      return;
    }

    const componentData = {
      id: Date.now().toString(),
      name: componentName,
      tree: JSON.parse(JSON.stringify(tree)), // Deep copy
      createdAt: new Date().toISOString(),
      language: selectedLanguage,
    };

    onSaveComponent(componentData);
    setComponentName("");
    setShowSaveForm(false);
  };

  const inferComponentName = (tree) => {
    if (!tree || (Array.isArray(tree) && tree.length === 0))
      return "GeneratedComponent";
    const root = Array.isArray(tree) ? tree[0] : tree;
    const fromProps = root?.props?.name || root?.props?.title;
    if (fromProps && typeof fromProps === "string") return fromProps;
    if (root?.type) return `${root.type}Component`;
    return "GeneratedComponent";
  };

  const handleGenerateCode = (component) => {
    if (!component) return;
    const language = component.language || "reactjs";
    const safeName =
      component.name && component.name.trim()
        ? component.name
        : inferComponentName(component.tree);
    const code = generateCode(component.tree, language);
    downloadCode(code, safeName, language);
  };

  const handleDelete = (id) => {
    if (!id) return;
    const confirmDelete = window.confirm("Delete this saved component?");
    if (!confirmDelete) return;
    if (typeof onDeleteComponent === "function") {
      onDeleteComponent(id);
    }
  };

  const generateCode = (tree, language) => {
    switch (language) {
      case "reactjs":
        return generateReactCode(tree);
      case "vuejs":
        return generateVueCode(tree);
      case "angular":
        return generateAngularCode(tree);
      case "javascript":
        return generateJavaScriptCode(tree);
      case "vite":
        return generateViteCode(tree);
      case "htmlcss":
        return generateHTMLCode(tree);
      default:
        return generateReactCode(tree);
    }
  };

  const generateReactCode = (tree) => {
    let imports = ["import React from 'react';"];
    let components = [];

    tree.forEach((node) => {
      const componentCode = generateReactComponent(node);
      if (componentCode) {
        components.push(componentCode);
      }
    });

    const mainComponent = `
function GeneratedComponent() {
  return (
    <div className="generated-component">
      ${tree.map((node) => `<${node.type}Component />`).join("\n      ")}
    </div>
  );
}

export default GeneratedComponent;
`;

    return {
      "package.json": JSON.stringify(
        {
          name: "generated-component",
          version: "1.0.0",
          dependencies: {
            react: "^18.0.0",
            "react-dom": "^18.0.0",
          },
        },
        null,
        2
      ),
      "src/index.js":
        imports.join("\n") +
        "\n\n" +
        components.join("\n\n") +
        "\n" +
        mainComponent,
      "README.md": `# Generated Component\n\nThis component was generated using the Component Reusability Analyzer.\n\n## Usage\n\n\`\`\`jsx\nimport GeneratedComponent from './src/index.js';\n\`\`\``,
    };
  };

  const generateReactComponent = (node) => {
    const props = node.props || {};
    const children = node.children || [];

    let componentCode = "";
    componentCode += `<>\n`;

    switch (node.type) {
      case "Form":
        const formStyle = `style={{ 
          width: '${props.width || "auto"}', 
          height: '${props.height || "auto"}', 
          backgroundColor: '${props.backgroundColor || "#182c66"}',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '20px',
          borderRadius: '8px'
        }}`;
        componentCode += `  <form className="form-container" ${formStyle}>\n`;
        componentCode += `    <h2>${props.title || "Form"}</h2>\n`;
        if (children.length > 0) {
          children.forEach((child) => {
            componentCode += `    ${generateReactComponent(child)}\n`;
          });
        }
        componentCode += `  </form>\n`;
        break;

      case "Card":
        const cardStyle = `style={{ 
          width: '${props.width || "auto"}', 
          height: '${props.height || "auto"}', 
          backgroundColor: '${props.backgroundColor || "#f8f9fa"}',
          maxWidth: '400px',
          margin: '0 auto',
          padding: '16px',
          borderRadius: '8px'
        }}`;
        componentCode += `  <div className="card" ${cardStyle}>\n`;
        if (props.title) {
          componentCode += `    <h3>${props.title}</h3>\n`;
        }
        if (children.length > 0) {
          children.forEach((child) => {
            componentCode += `    ${generateReactComponent(child)}\n`;
          });
        }
        componentCode += `  </div>\n`;
        break;

      case "Input":
        const inputStyle = `style={{ 
          width: '${props.width || "100%"}', 
          height: '${props.height || "40px"}', 
          backgroundColor: '${props.backgroundColor || "white"}',
          maxWidth: '300px',
          margin: '0 auto',
          display: 'block'
        }}`;
        componentCode += `  <input type="text" placeholder="${
          props.placeholder || "Enter text..."
        }" className="input-field" ${inputStyle} />\n`;
        break;

      case "PasswordInput":
        const passwordStyle = `style={{ 
          width: '${props.width || "100%"}', 
          height: '${props.height || "40px"}', 
          backgroundColor: '${props.backgroundColor || "white"}',
          maxWidth: '300px',
          margin: '0 auto',
          display: 'block'
        }}`;
        componentCode += `  <input type="password" placeholder="${
          props.placeholder || "Enter password..."
        }" className="password-field" ${passwordStyle} />\n`;
        break;

      case "Button":
        const buttonStyle = `style={{ 
          backgroundColor: '${props.buttonBgColor || "#3b82f6"}', 
          color: '${props.buttonTextColor || "#ffffff"}',
          width: '${props.width || "auto"}', 
          height: '${props.height || "auto"}',
          maxWidth: '200px',
          margin: '0 auto',
          display: 'block'
        }}`;
        componentCode += `  <button className="btn btn-${
          props.variant || "primary"
        }" ${buttonStyle}>${props.text || "Button"}</button>\n`;
        break;

      case "Label":
        const labelStyle = `style={{ 
          width: '${props.width || "auto"}', 
          height: '${props.height || "auto"}', 
          backgroundColor: '${props.backgroundColor || "transparent"}',
          textAlign: 'center',
          margin: '0 auto',
          display: 'block'
        }}`;
        componentCode += `  <label className="form-label" ${labelStyle}>${
          props.text || "Label"
        }</label>\n`;
        break;

      case "Logo":
        if (props.displayType === "image" && props.imageUrl) {
          const logoStyle = `style={{ 
            maxWidth: '${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            }', 
            maxHeight: '${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            }',
            width: '${props.width || "auto"}', 
            height: '${props.height || "auto"}', 
            backgroundColor: '${props.backgroundColor || "transparent"}',
            margin: '0 auto',
            display: 'block'
          }}`;
          componentCode += `  <img src="${props.imageUrl}" alt="${
            props.altText || "Logo"
          }" className="logo logo-${props.size || "medium"}" ${logoStyle} />\n`;
        } else {
          const logoStyle = `style={{ 
            maxWidth: '${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            }', 
            maxHeight: '${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            }',
            width: '${props.width || "auto"}', 
            height: '${props.height || "auto"}', 
            backgroundColor: '${props.backgroundColor || "transparent"}',
            margin: '0 auto',
            display: 'block'
          }}`;
          componentCode += `  <div className="logo logo-${
            props.size || "medium"
          }" ${logoStyle}>${props.text || "LOGO"}</div>\n`;
        }
        break;

      default:
        const defaultStyle = `style={{ 
          width: '${props.width || "auto"}', 
          height: '${props.height || "auto"}', 
          backgroundColor: '${props.backgroundColor || "transparent"}',
          margin: '0 auto',
          display: 'block'
        }}`;
        componentCode += `  <div ${defaultStyle}>${node.type}</div>\n`;
    }

    componentCode += `</>\n`;
    return componentCode;
  };

  const generateVueCode = (tree) => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Vue Component</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .generated-component { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-container { display: flex; flex-direction: column; gap: 16px; }
        .input-field, .password-field { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
        .btn { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
        .btn:hover { background: #0056b3; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; background: #f8f9fa; }
        .logo { text-align: center; font-weight: bold; color: #007bff; padding: 16px; border: 2px solid #007bff; border-radius: 8px; background: rgba(0,123,255,0.1); }
    </style>
</head>
<body>
    <div id="app">
        <div class="generated-component">
            ${tree.map((node) => generateVueNode(node)).join("\n            ")}
        </div>
    </div>

    <script>
        const { createApp } = Vue;
        
        createApp({
            data() {
                return {
                    // Component data here
                }
            }
        }).mount('#app');
    </script>
</body>
</html>`;

    return {
      "index.html": html,
      "README.md": `# Generated Vue Component\n\nThis component was generated using the Component Reusability Analyzer.\n\n## Usage\n\nSimply open the index.html file in your web browser.`,
    };
  };

  const generateAngularCode = (tree) => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Angular Component</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .generated-component { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-container { display: flex; flex-direction: column; gap: 16px; }
        .input-field, .password-field { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
        .btn { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
        .btn:hover { background: #0056b3; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; background: #f8f9fa; }
        .logo { text-align: center; font-weight: bold; color: #007bff; padding: 16px; border: 2px solid #007bff; border-radius: 8px; background: rgba(0,123,255,0.1); }
    </style>
</head>
<body>
    <div class="generated-component">
        ${tree.map((node) => generateHTMLNode(node)).join("\n        ")}
    </div>
</body>
</html>`;

    return {
      "index.html": html,
      "README.md": `# Generated Angular Component\n\nThis component was generated using the Component Reusability Analyzer.\n\n## Usage\n\nSimply open the index.html file in your web browser.`,
    };
  };

  const generateHTMLCode = (tree) => {
    const html = Array.isArray(tree)
      ? tree.map((node) => generateHTMLNode(node)).join("\n    ")
      : generateHTMLNode(tree);
    return {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated HTML Component</title>
    <style>
        ${generateCSS(tree)}
    </style>
</head>
<body>
    ${html}
    <script>
        ${generateJavaScript(tree)}
    </script>
</body>
</html>`,
      "README.md": `# Generated HTML Component

This component was generated using the Component Reusability Analyzer.

## Usage

Simply open the index.html file in your web browser.`,
    };
  };

  const generateJavaScriptCode = (tree) => {
    const componentName = tree[0]?.props?.name || "GeneratedComponent";
    const jsCode = generateJavaScriptNode(tree);

    return {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName}</title>
    <style>
        ${generateCSS(tree)}
    </style>
</head>
<body>
    <div id="app"></div>
    <script>
        ${jsCode}
    </script>
</body>
</html>`,
      "component.js": `// ${componentName} - Generated JavaScript Component
// This component was generated using the Component Reusability Analyzer

${generateJavaScriptNode(tree)}

// Initialize the component
document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = ${componentName}();
    }
});`,
      "README.md": `# ${componentName} - JavaScript Component

This component was generated using the Component Reusability Analyzer.

## Features
- Pure JavaScript implementation
- No external dependencies
- Responsive design
- Modern ES6+ syntax

## Usage
1. Open index.html in your web browser
2. The component will render automatically
3. Customize the component.js file as needed

## Structure
- \`index.html\`: Main HTML file with styling and script inclusion
- \`component.js\`: JavaScript component logic
- \`README.md\`: This documentation file`,
    };
  };

  const generateViteCode = (tree) => {
    const componentName = tree[0]?.props?.name || "GeneratedComponent";
    const reactCode = generateReactNode(tree);

    return {
      "package.json": `{
  "name": "${componentName.toLowerCase().replace(/\s+/g, "-")}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "vite": "^5.0.8"
  }
}`,
      "vite.config.js": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})`,
      "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${componentName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
      "src/main.jsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import ${componentName} from './${componentName}.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <${componentName} />
  </React.StrictMode>,
)`,
      "src/index.css": `${generateCSS(tree)}`,
      [`src/${componentName}.jsx`]: `import React from 'react';

// ${componentName} - Generated Vite + React Component
// This component was generated using the Component Reusability Analyzer

${reactCode}

export default ${componentName};`,
      "README.md": `# ${componentName} - Vite + React Component

This component was generated using the Component Reusability Analyzer.

## Features
- Modern Vite build tool
- React 18 with latest features
- Hot Module Replacement (HMR)
- Optimized production builds
- ESLint configuration

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`
This will start the development server at http://localhost:3000

### Build
\`\`\`bash
npm run build
\`\`\`
This will create a production build in the \`dist\` folder

### Preview
\`\`\`bash
npm run preview
\`\`\`
This will preview the production build locally

## Project Structure
- \`src/${componentName}.jsx\`: Main component file
- \`src/main.jsx\`: Application entry point
- \`src/index.css\`: Component styles
- \`index.html\`: HTML template
- \`vite.config.js\`: Vite configuration
- \`package.json\`: Dependencies and scripts

## Customization
Edit the component files in the \`src\` folder to customize your component.
The development server will automatically reload when you make changes.`,
    };
  };

  const generateVueNode = (node) => {
    const props = node.props || {};

    switch (node.type) {
      case "Form":
        return `<form class="form-container">
            <h2>${props.title || "Form"}</h2>
            ${(node.children || [])
              .map((child) => generateVueNode(child))
              .join("\n            ")}
        </form>`;

      case "Card":
        return `<div class="card">
            ${props.title ? `<h3>${props.title}</h3>` : ""}
            ${(node.children || [])
              .map((child) => generateVueNode(child))
              .join("\n            ")}
        </div>`;

      case "Input":
        return `<input type="text" class="input-field" placeholder="${
          props.placeholder || "Enter text..."
        }">`;

      case "PasswordInput":
        return `<input type="password" class="password-field" placeholder="${
          props.placeholder || "Enter password..."
        }">`;

      case "Button":
        return `<button class="btn">${props.text || "Button"}</button>`;

      case "Label":
        return `<label class="form-label">${props.text || "Label"}</label>`;

      case "Logo":
        if (props.displayType === "image" && props.imageUrl) {
          return `<img src="${props.imageUrl}" alt="${
            props.altText || "Logo"
          }" class="logo" style="max-width: ${
            props.size === "large"
              ? "120px"
              : props.size === "small"
              ? "60px"
              : "80px"
          }; max-height: ${
            props.size === "large"
              ? "120px"
              : props.size === "small"
              ? "60px"
              : "80px"
          }; object-fit: contain;">`;
        } else {
          return `<div class="logo">${props.text || "LOGO"}</div>`;
        }

      default:
        return `<div>${node.type}</div>`;
    }
  };

  const generateHTMLNode = (node) => {
    const props = node.props || {};

    switch (node.type) {
      case "Form":
        const formStyle = `style="
          width: ${props.width || "auto"}; 
          height: ${props.height || "auto"}; 
          background-color: ${props.backgroundColor || "#182c66"};
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border-radius: 8px;
        "`;
        return `<form class="form-container" ${formStyle}>
            <h2>${props.title || "Form"}</h2>
            ${(node.children || [])
              .map((child) => generateHTMLNode(child))
              .join("\n            ")}
        </form>`;

      case "Card":
        const cardStyle = `style="
          width: ${props.width || "auto"}; 
          height: ${props.height || "auto"}; 
          background-color: ${props.backgroundColor || "#f8f9fa"};
          max-width: 400px;
          margin: 0 auto;
          padding: 16px;
          border-radius: 8px;
        "`;
        return `<div class="card" ${cardStyle}>
            ${props.title ? `<h3>${props.title}</h3>` : ""}
            ${(node.children || [])
              .map((child) => generateHTMLNode(child))
              .join("\n            ")}
        </div>`;

      case "Input":
        const inputStyle = `style="
          width: ${props.width || "100%"}; 
          height: ${props.height || "40px"}; 
          background-color: ${props.backgroundColor || "white"};
          max-width: 300px;
          margin: 0 auto;
          display: block;
        "`;
        return `<input type="text" class="input-field" placeholder="${
          props.placeholder || "Enter text..."
        }" ${inputStyle}>`;

      case "PasswordInput":
        const passwordStyle = `style="
          width: ${props.width || "100%"}; 
          height: ${props.height || "40px"}; 
          background-color: ${props.backgroundColor || "white"};
          max-width: 300px;
          margin: 0 auto;
          display: block;
        "`;
        return `<input type="password" class="password-field" placeholder="${
          props.placeholder || "Enter password..."
        }" ${passwordStyle}>`;

      case "Button":
        const buttonStyle = `style="
          background-color: ${props.buttonBgColor || "#3b82f6"}; 
          color: ${props.buttonTextColor || "#ffffff"};
          width: ${props.width || "auto"}; 
          height: ${props.height || "auto"};
          max-width: 200px;
          margin: 0 auto;
          display: block;
        "`;
        return `<button class="btn" ${buttonStyle}>${
          props.text || "Button"
        }</button>`;

      case "Label":
        const labelStyle = `style="
          width: ${props.width || "auto"}; 
          height: ${props.height || "auto"}; 
          background-color: ${props.backgroundColor || "transparent"};
          text-align: center;
          margin: 0 auto;
          display: block;
        "`;
        return `<label class="form-label" ${labelStyle}>${
          props.text || "Label"
        }</label>`;

      case "Logo":
        if (props.displayType === "image" && props.imageUrl) {
          const logoStyle = `style="
            max-width: ${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            }; 
            max-height: ${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            };
            width: ${props.width || "auto"}; 
            height: ${props.height || "auto"}; 
            background-color: ${props.backgroundColor || "transparent"};
            margin: 0 auto;
            display: block;
          "`;
          return `<img src="${props.imageUrl}" alt="${
            props.altText || "Logo"
          }" class="logo" ${logoStyle}>`;
        } else {
          const logoStyle = `style="
            max-width: ${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            }; 
            max-height: ${
              props.size === "large"
                ? "120px"
                : props.size === "small"
                ? "60px"
                : "80px"
            };
            width: ${props.width || "auto"}; 
            height: ${props.height || "auto"}; 
            background-color: ${props.backgroundColor || "transparent"};
            margin: 0 auto;
            display: block;
          "`;
          return `<div class="logo" ${logoStyle}>${props.text || "LOGO"}</div>`;
        }

      default:
        const defaultStyle = `style="
          width: ${props.width || "auto"}; 
          height: ${props.height || "auto"}; 
          background-color: ${props.backgroundColor || "transparent"};
          margin: 0 auto;
          display: block;
        "`;
        return `<div ${defaultStyle}>${node.type}</div>`;
    }
  };

  const generateJavaScriptNode = (tree) => {
    const componentName = tree[0]?.props?.name || "GeneratedComponent";
    let code = `function ${componentName}() {\n`;
    code += `  return (\n`;
    code += `    <div class="generated-component">\n`;
    tree.forEach((node) => {
      code += `      ${generateJavaScriptComponent(node)}\n`;
    });
    code += `    </div>\n`;
    code += `  );\n`;
    code += `}\n\n`;
    return code;
  };

  const generateJavaScriptComponent = (node) => {
    const props = node.props || {};
    const children = node.children || [];
    let componentCode = "";

    switch (node.type) {
      case "Form":
        componentCode += `<form class="form-container">`;
        if (props.title) {
          componentCode += `<h2>${props.title}</h2>`;
        }
        children.forEach((child) => {
          componentCode += generateJavaScriptComponent(child);
        });
        componentCode += `</form>`;
        break;
      case "Card":
        componentCode += `<div class="card">`;
        if (props.title) {
          componentCode += `<h3>${props.title}</h3>`;
        }
        children.forEach((child) => {
          componentCode += generateJavaScriptComponent(child);
        });
        componentCode += `</div>`;
        break;
      case "Input":
        componentCode += `<input type="text" placeholder="${
          props.placeholder || "Enter text..."
        }" class="input-field" />`;
        break;
      case "PasswordInput":
        componentCode += `<input type="password" placeholder="${
          props.placeholder || "Enter password..."
        }" class="password-field" />`;
        break;
      case "Button":
        componentCode += `<button class="btn btn-${
          props.variant || "primary"
        }">${props.text || "Button"}</button>`;
        break;
      case "Label":
        componentCode += `<label class="form-label">${
          props.text || "Label"
        }</label>`;
        break;
      case "Logo":
        if (props.displayType === "image" && props.imageUrl) {
          componentCode += `<img src="${props.imageUrl}" alt="${
            props.altText || "Logo"
          }" class="logo logo-${props.size || "medium"}" style="max-width: ${
            props.size === "large"
              ? "120px"
              : props.size === "small"
              ? "60px"
              : "80px"
          }; max-height: ${
            props.size === "large"
              ? "120px"
              : props.size === "small"
              ? "60px"
              : "80px"
          };" />`;
        } else {
          componentCode += `<div class="logo logo-${props.size || "medium"}">${
            props.text || "LOGO"
          }</div>`;
        }
        break;
      default:
        componentCode += `<div>${node.type}</div>`;
    }
    return componentCode;
  };

  const generateReactNode = (tree) => {
    const componentName = tree[0]?.props?.name || "GeneratedComponent";
    let code = `function ${componentName}() {\n`;
    code += `  return (\n`;
    code += `    <div className="generated-component">\n`;
    tree.forEach((node) => {
      code += `      ${generateReactComponent(node)}\n`;
    });
    code += `    </div>\n`;
    code += `  );\n`;
    code += `}\n\n`;
    return code;
  };

  const generateCSS = (tree) => {
    let css = "";
    tree.forEach((node) => {
      if (node.type === "Form" || node.type === "Card") {
        css += `
.form-container,
.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
`;
      }
      if (node.type === "Input" || node.type === "PasswordInput") {
        css += `
.input-field,
.password-field {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}
`;
      }
      if (node.type === "Button") {
        css += `
.btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
.btn:hover {
  background: #0056b3;
}
`;
      }
      if (node.type === "Label") {
        css += `
.form-label {
  font-size: 16px;
  color: #333;
}
`;
      }
      if (node.type === "Logo") {
        css += `
.logo {
  text-align: center;
  font-weight: bold;
  color: #007bff;
  padding: 16px;
  border: 2px solid #007bff;
  border-radius: 8px;
  background: rgba(0,123,255,0.1);
}
`;
      }
    });
    return css;
  };

  const generateJavaScript = (tree) => {
    return `
// Generated JavaScript for ${tree[0]?.props?.name || "Component"}
document.addEventListener('DOMContentLoaded', function() {
  console.log('Component loaded successfully!');
  
  // Add any interactive functionality here
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('Button clicked:', e.target.textContent);
    });
  });
  
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', function(e) {
      console.log('Input changed:', e.target.value);
    });
  });
});
`;
  };

  const downloadCode = async (codeFiles, componentName, language) => {
    try {
      const zip = new JSZip();

      Object.entries(codeFiles).forEach(([filename, content]) => {
        zip.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${componentName}-${language}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(
        `Component "${componentName}" downloaded successfully as ${componentName}-${language}.zip`
      );
    } catch (error) {
      console.error("Error downloading code:", error);
      alert("Error downloading code. Please try again.");
    }
  };

  useEffect(() => {
    const handler = (e) => {
      const { tree: currentTree, language, name } = e.detail || {};
      if (!currentTree || !language || !name) return;
      const code = generateCode(currentTree, language);
      downloadCode(code, name, language);
    };
    window.addEventListener("download-current", handler);
    return () => window.removeEventListener("download-current", handler);
  });

  return (
    <div className="panel">
      <div className="panel-title">Component Manager</div>
      <div className="panel-body">
        <div className="manager-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowSaveForm(true)}
          >
            Save Current Canvas
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowGenerateForm(true)}
          >
            Generate Code
          </button>
        </div>

        {/* Save Component Form */}
        {showSaveForm && (
          <div className="save-form">
            <h4>Save Component</h4>
            <input
              type="text"
              placeholder="Enter component name"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="form-input"
            />
            <select
              className="form-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="reactjs">React.js</option>
              <option value="vuejs">Vue.js</option>
              <option value="angular">Angular</option>
              <option value="javascript">JavaScript</option>
              <option value="vite">Vite + React</option>
              <option value="htmlcss">HTML/CSS</option>
            </select>
            <div className="form-actions">
              <button className="btn btn-success" onClick={handleSaveComponent}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSaveForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Generate Code Form */}
        {showGenerateForm && (
          <div className="generate-form">
            <h4>Generate Code</h4>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="form-select"
            >
              <option value="reactjs">React.js</option>
              <option value="vuejs">Vue.js</option>
              <option value="angular">Angular</option>
              <option value="javascript">JavaScript</option>
              <option value="vite">Vite + React</option>
              <option value="htmlcss">HTML/CSS</option>
            </select>
            <div className="form-actions">
              <button
                className="btn btn-success"
                onClick={() =>
                  handleGenerateCode({ tree, language: selectedLanguage })
                }
              >
                Generate & Download
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowGenerateForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Saved Components List */}
        {savedComponents.length > 0 && (
          <div className="saved-components">
            <h4>Saved Components</h4>
            <div className="components-list">
              {savedComponents.map((component) => (
                <div key={component.id} className="component-item">
                  <div className="component-info">
                    <strong>{component.name}</strong>
                    <span className="component-date">
                      {new Date(component.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="component-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onLoadComponent(component)}
                    >
                      Load
                    </button>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleGenerateCode(component)}
                    >
                      Generate
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(component.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
