// -----------------------------------------------------------------------------
// Arquivo: src/components/SvgSpriteLoader.tsx
// -----------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';

export const SvgSpriteLoader: React.FC<{ url: string }> = ({ url }) => {
    const [svgContent, setSvgContent] = useState<string>('');

    useEffect(() => {
        const fetchSvg = async () => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const text = await response.text();
                    setSvgContent(text);
                }
            } catch (error) {
                console.error("Não foi possível carregar o template SVG:", error);
            }
        };
        fetchSvg();
    }, [url]);

    return <div dangerouslySetInnerHTML={{ __html: svgContent }} style={{ display: 'none' }} />;
};
