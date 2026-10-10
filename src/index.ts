import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { basename } from "node:path";
import { error } from "node:console";

const app = express();
const PORT = 3000;
const API_KEY = "1";
const BASE_URL = `https://www.thecocktaildb.com/api/json/v1/${API_KEY}`;

app.use(cors());
app.use(express.json());

async function fetchFromCocktailDB(endpoint: string): Promise<unknown> {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    console.error(err.message);
    res.status(500).json({ error: err.message || "Internal server error" });
}

app.get("/", (_req: Request, res: Response) => {
    res.json({
        message: "Cocktail API Server",
        endpoints: [
            "GET /random",
            "GET /search?s=name",
            "GET /search?f=letter",
            "GET /drink/:id",
            "GET /filter?i=ingredient",
            "GET /filter?a=Alcoholic|Non_Alcoholic",
            "GET /filter?c=category",
            "GET /filter?g=glass",
            "GET /list/categories",
            "GET /list/glasses",
            "GET /list/ingredients",
            "GET /list/alcoholic",
        ],
    });
});

// Losowy drink
app.get("/random", async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await fetchFromCocktailDB("/random.php");
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// Szukaj po nazwie (?s=) lub pierwszej literze (?f=)
app.get("/search", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { s, f } = req.query;

        if (s && typeof s === "string") {
            const data = await fetchFromCocktailDB(
                `/search.php?s=${encodeURIComponent(s)}`,
            );
            return res.json(data);
        }

        if (f && typeof f === "string" && f.length === 1) {
            const data = await fetchFromCocktailDB(
                `/search.php?f=${encodeURIComponent(f)}`,
            );
            return res.json(data);
        }

        res.status(400).json({
            error: "Podaj parametr 's' (nazwa) lub 'f' (pierwsza litera, 1 znak)",
        });
    } catch (err) {
        next(err);
    }
});

// Szczegóły drinka po ID
app.get(
    "/drink/:id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = await fetchFromCocktailDB(`/lookup.php?i=${id}`);
            return res.json(data);
        } catch (err) {
            next(err);
        }
    },
);

// Filtrowanie: ingredient (i), alcoholic (a), category (c), glass (g)
app.get("/filter", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { i, a, c, g } = req.query;

        if (i && typeof i === "string") {
            const data = await fetchFromCocktailDB(
                `/filter.php?i=${encodeURIComponent(i)}`,
            );
            return res.json(data);
        }

        if (a && typeof a === "string") {
            const data = await fetchFromCocktailDB(
                `/filter.php?a=${encodeURIComponent(a)}`,
            );
            return res.json(data);
        }

        if (c && typeof c === "string") {
            const data = await fetchFromCocktailDB(
                `/filter.php?c=${encodeURIComponent(c)}`,
            );
            return res.json(data);
        }

        if (g && typeof g === "string") {
            const data = await fetchFromCocktailDB(
                `/filter.php?g=${encodeURIComponent(g)}`,
            );
            return res.json(data);
        }

        res.status(400).json({
            error: "Podaj jeden z parametrów: i (ingredient), a (Alcoholic/Non_Alcoholic), c (category), g (glass)",
        });
    } catch (err) {
        next(err);
    }
});

app.get(
    "/list/categories",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await fetchFromCocktailDB("/list.php?c=list");
            res.json(data);
        } catch (err) {
            next(err);
        }
    },
);

app.get(
    "/list/glasses",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await fetchFromCocktailDB("/list.php?g=list");
            res.json(data);
        } catch (err) {
            next(err);
        }
    },
);

app.get(
    "/list/ingredients",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await fetchFromCocktailDB("/list.php?i=list");
            res.json(data);
        } catch (err) {
            next(err);
        }
    },
);

app.get(
    "/list/alcoholic",
    async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await fetchFromCocktailDB("/list.php?a=list");
            res.json(data);
        } catch (err) {
            next(err);
        }
    },
);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Cocktail API server running on http://localhost:${PORT}`);
});
