import { useEffect, useMemo, useState } from 'react';
import { products as staticProducts } from '../data/products';
import { backendApi } from '../api/backend';

const staticProductMap = new Map(staticProducts.map((product) => [product.id, product]));

function mergeProduct(product) {
  const local = staticProductMap.get(product.id);
  return {
    ...(local || {}),
    ...product,
    image: product.image || local?.image || '',
    features: product.features?.length ? product.features : (local?.features || []),
    variations: product.variations?.length ? product.variations : (local?.variations || []),
  };
}

export function useCatalog() {
  const [catalog, setCatalog] = useState(staticProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const backendProducts = await backendApi.getProducts();

        if (!isMounted) return;

        const merged = backendProducts.map(mergeProduct);
        const mergedIds = new Set(merged.map((product) => product.id));
        const untouchedStatic = staticProducts.filter((product) => !mergedIds.has(product.id));

        setCatalog([...merged, ...untouchedStatic]);
      } catch {
        if (isMounted) {
          setCatalog(staticProducts);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const byId = useMemo(() => new Map(catalog.map((product) => [product.id, product])), [catalog]);

  return { catalog, byId, isLoading };
}
