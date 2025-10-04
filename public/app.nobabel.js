const { useState, useEffect, useMemo, useRef } = React;
const e = React.createElement;

const isLocalPreview = window.location.protocol === 'file:';
const API_BASE = window.location.port === '5500' || isLocalPreview ? 'http://localhost:3000' : window.location.origin;
const BRAND_LOGO = resolveAsset('/assets/logo-hj.jpg');
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

function formatPrice(value) {
  return currencyFormatter.format(value);
}

function resolveAsset(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path)) return path;
  return API_BASE + path;
}
function Navbar(props) {
  return e(
    'header',
    { className: 'navbar' },
    e('div', { className: 'navbar-brand' },
      e('img', { src: BRAND_LOGO, alt: 'Logo Hermanos Jota', className: 'navbar-logo' }),
      e('div', null,
        e('h1', null, 'Mueblería Hermanos Jota'),
        e('p', { className: 'navbar-subtitle' }, 'Reinventa tus espacios con diseño local')
      )
    ),
    e('div', { className: 'navbar-actions' },
      e('button', { type: 'button', className: 'contact-btn', onClick: props.onScrollToContact }, 'Ir a contacto'),
      e('div', { className: 'cart', 'aria-live': 'polite' },
        e('span', null, 'Carrito'),
        e('strong', null, props.cartCount)
      )
    )
  );
}

function SearchFilters(props) {
  const hasPriceRange = props.priceBounds.max > 0 && props.priceBounds.max !== props.priceBounds.min;

  const searchField = e(
    'label',
    { className: 'filters-field search' },
    e('span', { className: 'filters-label' }, 'Buscar'),
    e('input', {
      type: 'search',
      placeholder: 'Sillas, mesas, estanterías...',
      value: props.query,
      onChange: event => props.onQueryChange(event.target.value)
    })
  );

  const sortField = e(
    'label',
    { className: 'filters-field sort' },
    e('span', { className: 'filters-label' }, 'Ordenar por'),
    e('select', {
      value: props.sort,
      onChange: event => props.onSortChange(event.target.value)
    },
      e('option', { value: 'featured' }, 'Destacado'),
      e('option', { value: 'price-asc' }, 'Precio: menor a mayor'),
      e('option', { value: 'price-desc' }, 'Precio: mayor a menor'),
      e('option', { value: 'name-asc' }, 'Nombre A-Z'),
      e('option', { value: 'stock-desc' }, 'Stock disponible')
    )
  );

  const categoryField = e(
    'label',
    { className: 'filters-field category' },
    e('span', { className: 'filters-label' }, 'Categoría'),
    e('select', {
      value: props.selectedCategory,
      onChange: event => props.onCategoryChange(event.target.value)
    },
      e('option', { value: 'all' }, 'Todas'),
      props.categories.map(cat => e('option', { key: cat, value: cat }, cat))
    )
  );

  const firstRow = e('div', { className: 'filters-row' }, searchField, sortField, categoryField);

  let secondRow = null;
  if (hasPriceRange) {
    const rangeField = e(
      'label',
      { className: 'filters-field range' },
      e('span', { className: 'filters-label' }, 'Precio máximo'),
      e('input', {
        type: 'range',
        min: props.priceBounds.min,
        max: props.priceBounds.max,
        step: 1000,
        value: props.selectedPrice,
        onChange: event => props.onPriceChange(Number(event.target.value))
      }),
      e('div', { className: 'range-values' },
        e('span', null, formatPrice(props.priceBounds.min)),
        e('strong', null, formatPrice(props.selectedPrice))
      )
    );

    const checkbox = e(
      'label',
      { className: 'filters-checkbox' },
      e('input', {
        type: 'checkbox',
        checked: props.onlyInStock,
        onChange: event => props.onToggleStock(event.target.checked)
      }),
      e('span', null, 'Solo en stock')
    );

    secondRow = e('div', { className: 'filters-row' }, rangeField, checkbox);
  }

  return e('div', { className: 'filters' }, firstRow, secondRow);
}

function ProductCard(props) {
  const className = props.className ? ' ' + props.className : '';

  function handleAdd(event) {
    event.stopPropagation();
    props.onAdd(props.product, 1);
  }

  const stockClass = 'stock-tag ' + (props.product.stock > 0 ? 'available' : 'sold-out');
  const cardClasses = ('card' + className).trim();

  return e(
    'article',
    { className: cardClasses, onClick: () => props.onSelect(props.product) },
    e('figure', { className: 'card-media' },
      e('img', { src: resolveAsset(props.product.image), alt: props.product.nombre, loading: 'lazy' }),
      e('figcaption', { className: stockClass }, props.product.stock > 0 ? 'Stock: ' + props.product.stock : 'Sin stock')
    ),
    e('div', { className: 'card-body' },
      e('h3', null, props.product.nombre),
      e('p', null, props.product.descripcion)
    ),
    e('div', { className: 'card-footer' },
      e('div', null,
        e('span', { className: 'price' }, formatPrice(props.product.precio)),
        e('span', { className: 'card-category' }, props.product.categoria)
      ),
      e('button', {
        type: 'button',
        className: 'secondary',
        onClick: handleAdd,
        disabled: props.product.stock === 0
      }, 'Añadir')
    )
  );
}

function ProductDetail(props) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [props.product ? props.product.id : null]);

  if (!props.product) {
    return e('div', { className: 'detail empty-detail' },
      e('h3', null, 'Explora nuestro catálogo'),
      e('p', null, 'Selecciona un producto para ver los detalles completos y agregarlo al carrito.')
    );
  }

  function handleQuantityChange(value) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      const safeValue = Math.max(1, Math.min(parsed, props.product.stock || 1));
      setQuantity(safeValue);
    }
  }

  return e('div', { className: 'detail' },
    e('img', { src: resolveAsset(props.product.image), alt: props.product.nombre, className: 'detail-image' }),
    e('div', { className: 'detail-content' },
      e('h2', null, props.product.nombre),
      e('p', null, props.product.descripcion),
      e('dl', { className: 'detail-meta' },
        e('div', null,
          e('dt', null, 'Precio'),
          e('dd', null, formatPrice(props.product.precio))
        ),
        e('div', null,
          e('dt', null, 'Stock'),
          e('dd', null, props.product.stock || 0)
        ),
        e('div', null,
          e('dt', null, 'Categoría'),
          e('dd', null, props.product.categoria)
        )
      ),
      e('div', { className: 'detail-actions' },
        e('label', null,
          'Cantidad',
          e('input', {
            type: 'number',
            min: 1,
            max: props.product.stock,
            value: quantity,
            onChange: event => handleQuantityChange(event.target.value)
          })
        ),
        e('button', {
          type: 'button',
          onClick: () => props.onAdd(props.product, quantity),
          disabled: props.product.stock === 0
        }, 'Añadir al carrito')
      )
    )
  );
}

function CartPanel(props) {
  if (!props.items.length) {
    return e('div', { className: 'cart-list empty' },
      e('h3', null, 'Carrito'),
      e('p', null, 'Añade productos para comenzar tu pedido.')
    );
  }

  return e('div', { className: 'cart-list' },
    e('div', { className: 'cart-header' },
      e('h3', null, 'Carrito'),
      e('button', { type: 'button', className: 'link', onClick: props.onClear }, 'Vaciar')
    ),
    e('ul', null,
      props.items.map(item => e('li', { key: item.id },
        e('img', { src: resolveAsset(item.image), alt: item.nombre, loading: 'lazy' }),
        e('div', { className: 'cart-item-info' },
          e('strong', null, item.nombre),
          e('span', { className: 'cart-price' }, formatPrice(item.precio))
        ),
        e('div', { className: 'cart-controls' },
          e('button', {
            type: 'button',
            onClick: () => props.onQuantityChange(item.id, item.quantity - 1),
            disabled: item.quantity === 1
          }, '−'),
          e('span', null, item.quantity),
          e('button', {
            type: 'button',
            onClick: () => props.onQuantityChange(item.id, item.quantity + 1),
            disabled: item.stock && item.quantity >= item.stock
          }, '+'),
          e('button', { type: 'button', className: 'link', onClick: () => props.onRemove(item.id) }, 'Quitar')
        )
      ))
    ),
    e('div', { className: 'cart-total' },
      e('span', null, 'Total estimado'),
      e('strong', null, formatPrice(props.total))
    )
  );
}

function BrandManual() {
  const pillars = [
    'Diseño cálido y funcional que acompaña la vida cotidiana.',
    'Versatilidad modular para adaptarse a cada ambiente.',
    'Materiales nobles trabajados con procesos responsables.',
    'Servicio cercano que acompaña cada decisión de compra.'
  ];

  const drivers = [
    'Hecho en Argentina con oficios locales.',
    'Personalización por medidas, tapizados y terminaciones.',
    'Garantía de 5 años sobre estructura y herrajes.',
    'Envío nacional con seguimiento humano en cada etapa.'
  ];

  const toneDo = [
    'Hablar en primera persona plural para incluir al cliente.',
    'Priorizar verbos de acción y beneficios concretos.',
    'Mantener un ritmo cálido, profesional y optimista.'
  ];

  const toneAvoid = [
    'Evitar tecnicismos innecesarios o jerga fría.',
    'No usar frases impositivas ni promesas vacías.',
    'Reducir los signos de exclamación y mayúsculas excesivas.'
  ];

  const palette = [
    { name: 'Terracota', hex: '#A0582C', rgb: '160, 88, 44', use: 'Uso principal y titulares' },
    { name: 'Oliva', hex: '#6B7D3B', rgb: '107, 125, 59', use: 'Acentos y CTAs secundarios' },
    { name: 'Musgo', hex: '#7D8C66', rgb: '125, 140, 102', use: 'Fondos suaves y bloques informativos' },
    { name: 'Beige', hex: '#D6C59B', rgb: '214, 197, 155', use: 'Fondos cálidos' },
    { name: 'Arena', hex: '#E8D6B3', rgb: '232, 214, 179', use: 'Superficies extensas y contención' }
  ];

  const typeScale = [
    { role: 'Titulares', family: 'Playfair Display', fallback: 'serif', notes: 'Encabezados, claims, cifras destacadas.' },
    { role: 'Texto corrido', family: 'Lato', fallback: 'sans-serif', notes: 'Párrafos, botones y microcopys.' }
  ];

  const applications = [
    'Header con logo en terracota y CTA directo a contacto.',
    'Hero con fotografía de ambiente y mensaje emocional.',
    'Bloque de valores y sello de garantía visible.',
    'CTA secundario para agendar asesoramiento personalizado.',
    'Sección de catálogo destacando modularidad y stock.'
  ];

  const deliverables = [
    'Sistema de iconos de trazo simple y vértices redondeados.',
    'Mockups de piezas digitales: newsletter, banners y redes.',
    'Documentos comerciales y fichas técnicas con la paleta oficial.',
    'Plantillas editables para cotizaciones y presentaciones.'
  ];

  return e(
    'section',
    { className: 'brand-manual', id: 'manual' },
    e('div', { className: 'brand-manual__header' },
      e('div', null,
        e('p', { className: 'brand-manual__eyebrow' }, 'Manual de marca'),
        e('h2', null, 'Hermanos Jota'),
        e('p', null, 'Guía compacta con el propósito, los pilares de comunicación y los recursos visuales que garantizan coherencia en cada pieza digital.')
      ),
      e('div', { className: 'brand-manual__meta' },
        e('span', null, 'Buenos Aires · 2024'),
        e('span', null, 'Versión 1.0')
      )
    ),
    e('div', { className: 'brand-manual__cards' },
      e('article', { className: 'brand-card' },
        e('h3', null, 'Propósito'),
        e('p', null, 'Diseñamos y producimos muebles honestos que celebran la calidez de los hogares latinoamericanos, combinando tradición carpintera con estética contemporánea.'),
        e('p', null,
          e('strong', null, 'Promesa:'),
          ' acompañar cada proyecto con piezas duraderas, personalizables y fabricadas con respeto por las personas y la materia prima.'
        )
      ),
      e('article', { className: 'brand-card' },
        e('h3', null, 'Pilares de marca'),
        e('ul', null, pillars.map(point => e('li', { key: point }, point)))
      ),
      e('article', { className: 'brand-card' },
        e('h3', null, 'Motivadores de compra'),
        e('ul', null, drivers.map(point => e('li', { key: point }, point)))
      ),
      e('article', { className: 'brand-card' },
        e('h3', null, 'Tono de voz'),
        e('div', { className: 'tone-grid' },
          e('div', null,
            e('span', { className: 'tone-label tone-do' }, 'Hacer'),
            e('ul', null, toneDo.map(point => e('li', { key: point }, point)))
          ),
          e('div', null,
            e('span', { className: 'tone-label tone-dont' }, 'Evitar'),
            e('ul', null, toneAvoid.map(point => e('li', { key: point }, point)))
          )
        )
      ),
      e('article', { className: 'brand-card' },
        e('h3', null, 'Paleta cromática'),
        e('ul', { className: 'palette-list' },
          palette.map(color => e('li', { key: color.name },
            e('span', { className: 'palette-swatch', style: { backgroundColor: color.hex }, 'aria-hidden': 'true' }),
            e('div', null,
              e('strong', null, color.name),
              e('span', null, color.hex),
              e('small', null, color.use),
              e('small', null, 'RGB ' + color.rgb)
            )
          ))
        )
      ),
      e('article', { className: 'brand-card' },
        e('h3', null, 'Tipografías'),
        e('table', { className: 'type-table' },
          e('thead', null,
            e('tr', null,
              e('th', null, 'Uso'),
              e('th', null, 'Familia'),
              e('th', null, 'Notas')
            )
          ),
          e('tbody', null,
            typeScale.map(type => e('tr', { key: type.role },
              e('td', null, type.role),
              e('td', null,
                type.family,
                e('span', { className: 'type-fallback' }, ' (' + type.fallback + ')')
              ),
              e('td', null, type.notes)
            ))
          )
        ),
        e('p', { className: 'type-note' }, 'Las fuentes se cargan desde Google Fonts para asegurar consistencia en web y piezas impresas.')
      ),
      e('article', { className: 'brand-card' },
        e('h3', null, 'Aplicaciones digitales'),
        e('ul', null, applications.map(point => e('li', { key: point }, point)))
      ),
      e('article', { className: 'brand-card' },
        e('h3', null, 'Recursos visuales'),
        e('ul', null, deliverables.map(point => e('li', { key: point }, point))),
        e('p', { className: 'brand-card__footer' },
          'Solicitá los archivos editables escribiendo a ',
          e('a', { href: 'mailto:hola@hermanosjota.com' }, 'hola@hermanosjota.com'),
          '.'
        )
      )
    )
  );
}

function ContactForm(props) {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [success, setSuccess] = useState(null);
  const mensajeMax = 500;

  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    setForm(prev => Object.assign({}, prev, {
      [name]: value.slice(0, name === 'mensaje' ? mensajeMax : undefined)
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log('Contacto enviado:', form);
    setSuccess('¡Gracias por escribirnos! Te responderemos dentro de las próximas 24 horas.');
    setForm({ nombre: '', email: '', mensaje: '' });
  }

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timeout);
  }, [success]);

  return e('section', { ref: props.sectionRef, className: 'contact', 'aria-label': 'Formulario de contacto' },
    e('h2', null, '¿Necesitás asesoramiento?'),
    e('p', { className: 'contact-intro' }, 'Dejanos tus datos y un especialista en mobiliario se comunicará con vos.'),
    e('form', { onSubmit: handleSubmit },
      e('label', null,
        'Nombre',
        e('input', { name: 'nombre', value: form.nombre, onChange: handleChange, required: true })
      ),
      e('label', null,
        'Email',
        e('input', { name: 'email', type: 'email', value: form.email, onChange: handleChange, required: true })
      ),
      e('label', null,
        'Mensaje',
        e('textarea', {
          name: 'mensaje',
          value: form.mensaje,
          onChange: handleChange,
          required: true,
          rows: 4,
          placeholder: 'Contanos qué ambiente querés transformar...'
        }),
        e('span', { className: 'char-count' }, mensajeMax - form.mensaje.length, ' caracteres restantes')
      ),
      e('button', { type: 'submit' }, 'Enviar mensaje')
    ),
    success ? e('div', { className: 'success', role: 'status' }, success) : null
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [sort, setSort] = useState('featured');
  const [justAdded, setJustAdded] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const contactRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_BASE + '/api/productos')
      .then(response => {
        if (!response.ok) throw new Error('Error al cargar productos');
        return response.json();
      })
      .then(data => {
        setProducts(data);
        if (data.length) {
          const precios = data.map(p => p.precio);
          const bounds = {
            min: Math.min.apply(null, precios),
            max: Math.max.apply(null, precios)
          };
          setPriceBounds(bounds);
          setSelectedPrice(bounds.max);
          setSelected(data[0]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!products.length) return;
    setCart(prev => prev
      .map(item => {
        const productData = products.find(p => p.id === item.id);
        return productData ? Object.assign({}, productData, { quantity: item.quantity }) : null;
      })
      .filter(Boolean)
    );
  }, [products]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.warn('No se pudo restaurar el carrito desde localStorage', err);
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem('cart', JSON.stringify(cart));
    } catch (err) {
      console.warn('No se pudo guardar el carrito en localStorage', err);
    }
  }, [cart]);

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(null), 2500);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  const categories = useMemo(() => {
    const unique = new Set(products.map(p => p.categoria));
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'es'));
  }, [products]);

  useEffect(() => {
    const onScroll = () => {
      const nav = document.querySelector('.navbar');
      if (!nav) return;
      if (window.scrollY > 12) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartSummary = useMemo(() => {
    return cart.reduce((acc, item) => ({
      quantity: acc.quantity + item.quantity,
      total: acc.total + item.precio * item.quantity
    }), { quantity: 0, total: 0 });
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products
      .filter(product => {
        if (!normalizedQuery) return true;
        return (
          product.nombre.toLowerCase().includes(normalizedQuery) ||
          product.descripcion.toLowerCase().includes(normalizedQuery)
        );
      })
      .filter(product => (onlyInStock ? product.stock > 0 : true))
      .filter(product => (selectedPrice ? product.precio <= selectedPrice : true))
      .filter(product => (selectedCategory === 'all' ? true : product.categoria === selectedCategory));

    const sorted = filtered.slice();
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.precio - a.precio);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        break;
      case 'stock-desc':
        sorted.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      default:
        sorted.sort((a, b) => {
          const stockDiff = (b.stock || 0) - (a.stock || 0);
          return stockDiff !== 0 ? stockDiff : a.precio - b.precio;
        });
        break;
    }

    return sorted;
  }, [products, query, onlyInStock, selectedPrice, sort, selectedCategory]);

  function handleSelect(product) {
    setSelected(product);
  }

  function handleAddToCart(product, quantity) {
    if (!product) return;
    if (quantity === undefined) quantity = 1;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => {
          if (item.id === product.id) {
            const nextQuantity = Math.min((item.quantity || 1) + quantity, product.stock || Infinity);
            return Object.assign({}, item, { quantity: nextQuantity });
          }
          return item;
        });
      }
      return prev.concat([Object.assign({}, product, { quantity })]);
    });
    setJustAdded(product.nombre);
  }

  function handleQuantityChange(productId, quantity) {
    setCart(prev => prev
      .map(item => item.id === productId ? Object.assign({}, item, { quantity: Math.max(1, quantity) }) : item)
      .filter(item => item.quantity > 0)
    );
  }

  function handleRemove(productId) {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  function handleClearCart() {
    setCart([]);
  }

  function handleScrollToContact() {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return e('div', null,
    e(Navbar, { cartCount: cartSummary.quantity, onScrollToContact: handleScrollToContact }),
    e('main', { className: 'container' },
      e('section', { className: 'catalog' },
        e('div', { className: 'catalog-header' },
          e('div', null,
            e('h2', null, 'Catálogo'),
            e('p', { className: 'catalog-subtitle' }, 'Filtrá y encontrá el mueble perfecto para tu hogar')
          ),
          justAdded ? e('div', { className: 'toast', role: 'status' }, justAdded + ' agregado al carrito') : null
        ),
        e(SearchFilters, {
          query: query,
          onQueryChange: setQuery,
          priceBounds: priceBounds,
          selectedPrice: selectedPrice,
          onPriceChange: setSelectedPrice,
          sort: sort,
          onSortChange: setSort,
          onlyInStock: onlyInStock,
          onToggleStock: setOnlyInStock,
          categories: categories,
          selectedCategory: selectedCategory,
          onCategoryChange: setSelectedCategory
        }),
        loading ? e('div', { className: 'grid' },
          Array.from({ length: 6 }).map((_, idx) => e('div', { key: idx, className: 'skeleton-card' }))
        ) : null,
        error ? e('p', { className: 'error' }, error) : null,
        !loading && !error ? (
          filteredProducts.length ? e('div', { className: 'grid' },
            filteredProducts.map((product, index) => e(ProductCard, {
              key: product.id,
              product: product,
              onSelect: handleSelect,
              onAdd: handleAddToCart,
              className: 'fade-in-up delay-' + (index % 3)
            }))
          ) : e('div', { className: 'empty-results' },
            e('h3', null, 'No encontramos resultados'),
            e('p', null, 'Modificá los filtros o limpiá la búsqueda para ver más productos.'),
            e('button', {
              type: 'button',
              className: 'link',
              onClick: () => {
                setQuery('');
                setOnlyInStock(false);
                setSelectedPrice(priceBounds.max);
                setSelectedCategory('all');
              }
            }, 'Restablecer filtros')
          )
        ) : null
      ),
      e('aside', { className: 'sidebar' },
        e(ProductDetail, { product: selected, onAdd: handleAddToCart }),
        e(CartPanel, {
          items: cart,
          total: cartSummary.total,
          onQuantityChange: handleQuantityChange,
          onRemove: handleRemove,
          onClear: handleClearCart
        }),
        e(ContactForm, { sectionRef: contactRef })
      )
    ),
    e(BrandManual, null)
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(e(App));
