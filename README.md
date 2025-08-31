<div align="center">
  <img src="public/icons/android-chrome-512x512.png" alt="CSRGen Logo" width="128" height="128">
  <h1 align="center">Browser-Based CSR Generator Extension</h1>
  <p align="center">
    A secure, client-side browser extension for generating Certificate Signing Requests (CSRs) and private keys directly in your browser.
  </p>
</div>

## ✨ Features

*   **Client-Side Security**: All cryptographic operations are performed locally in your browser. No data, including your private key, ever leaves your machine.
*   **Comprehensive CSR Configuration**:
    *   **Subject**: Common Name (CN), Organization (O), Organizational Unit (OU), Country (C), State (ST), and Locality (L).
    *   **Subject Alternative Names (SANs)**: Supports DNS, IP Address, Email, URI, and User Principal Name (UPN).
    *   **Key Types**: RSA and ECDSA with configurable key sizes and curves.
    *   **Extensions**: Define Key Usage, Extended Key Usage (EKU), and Basic Constraints.
*   **Private Key Encryption**: Optionally encrypt your generated private key with a passphrase for added security.
*   **Modern Tech Stack**: Built with React, TypeScript, Vite, and styled with Tailwind CSS.
*   **Web Worker Powered**: CSR generation is handled in a background thread, ensuring the UI remains responsive.

## 🚀 Installation

**Prerequisites:** [Node.js](https://nodejs.org/) (v18 or later recommended)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/CSRGen.git
    cd CSRGen
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the extension:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory containing the production-ready extension files.

4.  **Load the extension in your browser:**

    *   **Chrome/Edge:**
        1.  Navigate to `chrome://extensions`.
        2.  Enable **Developer mode**.
        3.  Click **Load unpacked**.
        4.  Select the `dist` directory from this project.

    *   **Firefox:**
        1.  Navigate to `about:debugging`.
        2.  Click **This Firefox**.
        3.  Click **Load Temporary Add-on...**.
        4.  Select the `manifest.json` file inside the `dist` directory.

## Available Scripts

*   `npm run dev`: Starts the development server with hot-reloading for easier development. The extension must still be loaded as an unpacked extension.
*   `npm run build`: Builds the extension for production.
*   `npm run preview`: Previews the production build locally (less useful for extension development).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.