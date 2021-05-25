document.querySelectorAll("style").forEach((style) => {
    const lines = style.innerHTML.split("\n").map((l) => l.trim());

    let toSkip = 0;

    lines.forEach((line, i) => {
        if (toSkip) return toSkip--;

        const extend = line.match(/^(.+)\s+extends\s+(.+)\s+\{/)?.[0];

        if (!extend) return;

        const block = lines.slice(i + 1, i + lines.slice(i).indexOf(lines.slice(i).find((l) => l.trim().endsWith("}"))!));

        toSkip = block.length + 1;

        const [sub, sup] = extend.split("extends").map((p) => (p.trim().endsWith("{") ? p.trim().slice(0, -1) : p.trim()));

        const inherited = lines
            .map((l, index) =>
                l.trim().startsWith(sup)
                    ? {
                          trait: l.trim().startsWith(sup),
                          index,
                      }
                    : ((undefined as unknown) as { trait: string; index: number })
            )
            .filter(($) => !!$);

        if (!inherited) return;

        return inherited.forEach(({ trait, index }) => {
            const inheritedBlock = lines.slice(index + 1, index + lines.slice(index).indexOf(lines.slice(index).find((l) => l.trim().endsWith("}"))!));

            block.unshift(...inheritedBlock);

            lines.splice(i, toSkip, `${sub} {`, ...block);
        });
    });

    style.innerHTML = lines.join("\n");
});
