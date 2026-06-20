export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const hostname = url.hostname;
        const pathname = url.pathname;

        let kvKey;

        if (hostname === "resume.hudater.dev") {
            // serve only root: resume/<filename>
            // any path other than "/" redirects to "/"
            const filename = pathname === "/" ? null : pathname.slice(1);
            if (!filename) {
                // OLD
                // find and serve the single resume file
                // const list = await env.RESUME_KV.list({ prefix: "resume/" });
                // if (!list.keys.length) return new Response("Not found", { status: 404 });
                // kvKey = list.keys[0].name;
                // NEW: hardcoded filename to avoid thrashing by calling kv.list on each request
                kvKey = "resume/Harshit_SRE_Infrastructure_DevOps_Resume.pdf";
            } else {
                return Response.redirect("https://resume.hudater.dev/", 301);
            }
        } else if (hostname === "showcase.hudater.dev") {
            if (pathname === "/") return new Response("Not found", { status: 404 });
            kvKey = "showcase" + pathname; // pathname already has leading /
        } else {
            return new Response("Not found", { status: 404 });
        }

        const file = await env.RESUME_KV.get(kvKey, { type: "arrayBuffer" });
        if (!file) return new Response("Not found", { status: 404 });

        const ext = kvKey.split(".").pop().toLowerCase();
        const contentTypes = {
            pdf: "application/pdf",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            svg: "image/svg+xml",
        };
        const contentType = contentTypes[ext] || "application/octet-stream";
        const filename = kvKey.split("/").pop();

        return new Response(file, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${filename}"`,
                "Cache-Control": "public, max-age=3600",
            },
        });
    },
};
