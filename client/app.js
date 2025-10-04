const { useState, useEffect, useMemo, useRef } = React;

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
  return `${API_BASE}${path}`;
}
function Navbar({ cartCount, onScrollToContact }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <img src={BRAND_LOGO} alt="Logo Hermanos Jota" className="navbar-logo" />
        <div>
          <h1>Mueblería Hermanos Jota</h1>
          <p className="navbar-subtitle">Reinventa tus espacios con diseño local</p>
        </div>
      </div>
      <div className="navbar-actions">
        <button type="button" className="contact-btn" onClick={onScrollToContact}>
          Ir a contacto
        </button>
        <div className="cart" aria-live="polite">
          <span>Carrito</span>
          <strong>{cartCount}</strong>
        </div>
      </div>
    </header>
  );
}

function SearchFilters({
  query,
  onQueryChange,
  priceBounds,
  selectedPrice,
  onPriceChange,
  sort,
  onSortChange,
  onlyInStock,
  onToggleStock,
  categories,
  selectedCategory,
  onCategoryChange
}) {
  const hasPriceRange = priceBounds.max > 0 && priceBounds.max !== priceBounds.min;

  return (
    <div className="filters">
      <div className="filters-row">
        <label className="filters-field search">
          <span className="filters-label">Buscar</span>
          <input
            type="search"
            placeholder="Sillas, mesas, estanterías..."
            value={query}
            onChange={e => onQueryChange(e.target.value)}
          />
        </label>

        <label className="filters-field sort">
          <span className="filters-label">Ordenar por</span>
          <select value={sort} onChange={e => onSortChange(e.target.value)}>
            <option value="featured">Destacado</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="stock-desc">Stock disponible</option>
          </select>
        </label>

        <label className="filters-field category">
          <span className="filters-label">Categoría</span>
          <select value={selectedCategory} onChange={e => onCategoryChange(e.target.value)}>
            <option value="all">Todas</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
      </div>

      {hasPriceRange && (
        <div className="filters-row">
          <label className="filters-field range">
            <span className="filters-label">Precio máximo</span>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1000}
              value={selectedPrice}
              onChange={e => onPriceChange(Number(e.target.value))}
            />
            <div className="range-values">
              <span>{formatPrice(priceBounds.min)}</span>
              <strong>{formatPrice(selectedPrice)}</strong>
            </div>
          </label>

          <label className="filters-checkbox">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={e => onToggleStock(e.target.checked)}
            />
            <span>Solo en stock</span>
          </label>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onSelect, onAdd, className = '' }) {
  const handleAdd = event => {
    event.stopPropagation();
    onAdd(product, 1);
  };

  const cardClasses = `card ${className}`.trim();

  return (
    <article className={cardClasses} onClick={() => onSelect(product)}>
      <figure className="card-media">
        <img src={resolveAsset(product.image)} alt={product.nombre} loading="lazy" />
        <figcaption className={`stock-tag ${product.stock > 0 ? 'available' : 'sold-out'}`}>
          {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
        </figcaption>
      </figure>
      <div className="card-body">
        <h3>{product.nombre}</h3>
        <p>{product.descripcion}</p>
      </div>
      <div className="card-footer">
        <div>
          <span className="price">{formatPrice(product.precio)}</span>
          <span className="card-category">{product.categoria}</span>
        </div>
        <button type="button" className="secondary" onClick={handleAdd} disabled={product.stock === 0}>
          Añadir
        </button>
      </div>
    </article>
  );
}

function ProductDetail({ product, onAdd }) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [product ? product.id : null]);

  if (!product) {
    return (
      <div className="detail empty-detail">
        <h3>Explora nuestro catálogo</h3>
        <p>Selecciona un producto para ver los detalles completos y agregarlo al carrito.</p>
      </div>
    );
  }

  const handleQuantityChange = value => {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      const safeValue = Math.max(1, Math.min(parsed, product.stock || 1));
      setQuantity(safeValue);
    }
  };

  return (
    <div className="detail">
      <img src={resolveAsset(product.image)} alt={product.nombre} className="detail-image" />
      <div className="detail-content">
        <h2>{product.nombre}</h2>
        <p>{product.descripcion}</p>
        <dl className="detail-meta">
          <div>
            <dt>Precio</dt>
            <dd>{formatPrice(product.precio)}</dd>
          </div>
          <div>
            <dt>Stock</dt>
            <dd>{product.stock || 0}</dd>
          </div>
          <div>
            <dt>Categoría</dt>
            <dd>{product.categoria}</dd>
          </div>
        </dl>

        <div className="detail-actions">
          <label>
            Cantidad
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={e => handleQuantityChange(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => onAdd(product, quantity)}
            disabled={product.stock === 0}
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPanel({ items, total, onQuantityChange, onRemove, onClear }) {
  if (!items.length) {
    return (
      <div className="cart-list empty">
        <h3>Carrito</h3>
        <p>Añade productos para comenzar tu pedido.</p>
      </div>
    );
  }

  return (
    <div className="cart-list">
      <div className="cart-header">
        <h3>Carrito</h3>
        <button type="button" className="link" onClick={onClear}>
          Vaciar
        </button>
      </div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <img src={resolveAsset(item.image)} alt={item.nombre} loading="lazy" />
            <div className="cart-item-info">
              <strong>{item.nombre}</strong>
              <span className="cart-price">{formatPrice(item.precio)}</span>
            </div>
            <div className="cart-controls">
              <button type="button" onClick={() => onQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity === 1}>
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                disabled={item.stock && item.quantity >= item.stock}
              >
                +
              </button>
              <button type="button" className="link" onClick={() => onRemove(item.id)}>
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <span>Total estimado</span>
        <strong>{formatPrice(total)}</strong>
      </div>
    </div>
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

  return (
    <section className="brand-manual" id="manual">
      <div className="brand-manual__header">
        <div>
          <p className="brand-manual__eyebrow">Manual de marca</p>
          <h2>Hermanos Jota</h2>
          <p>Guía compacta con el propósito, los pilares de comunicación y los recursos visuales que garantizan coherencia en cada pieza digital.</p>
        </div>
        <div className="brand-manual__meta">
          <span>Buenos Aires · 2024</span>
          <span>Versión 1.0</span>
        </div>
      </div>

      <div className="brand-manual__cards">
        <article className="brand-card">
          <h3>Propósito</h3>
          <p>Diseñamos y producimos muebles honestos que celebran la calidez de los hogares latinoamericanos, combinando tradición carpintera con estética contemporánea.</p>
          <p><strong>Promesa:</strong> acompañar cada proyecto con piezas duraderas, personalizables y fabricadas con respeto por las personas y la materia prima.</p>
        </article>

        <article className="brand-card">
          <h3>Pilares de marca</h3>
          <ul>
            {pillars.map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>

        <article className="brand-card">
          <h3>Motivadores de compra</h3>
          <ul>
            {drivers.map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>

        <article className="brand-card">
          <h3>Tono de voz</h3>
          <div className="tone-grid">
            <div>
              <span className="tone-label tone-do">Hacer</span>
              <ul>
                {toneDo.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="tone-label tone-dont">Evitar</span>
              <ul>
                {toneAvoid.map(point => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="brand-card">
          <h3>Paleta cromática</h3>
          <ul className="palette-list">
            {palette.map(color => (
              <li key={color.name}>
                <span className="palette-swatch" style={{ backgroundColor: color.hex }} aria-hidden="true" />
                <div>
                  <strong>{color.name}</strong>
                  <span>{color.hex}</span>
                  <small>{color.use}</small>
                  <small>RGB {color.rgb}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="brand-card">
          <h3>Tipografías</h3>
          <table className="type-table">
            <thead>
              <tr>
                <th>Uso</th>
                <th>Familia</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {typeScale.map(type => (
                <tr key={type.role}>
                  <td>{type.role}</td>
                  <td>{type.family} <span className="type-fallback">({type.fallback})</span></td>
                  <td>{type.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="type-note">Las fuentes se cargan desde Google Fonts para asegurar consistencia en web y piezas impresas.</p>
        </article>

        <article className="brand-card">
          <h3>Aplicaciones digitales</h3>
          <ul>
            {applications.map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>

        <article className="brand-card">
          <h3>Recursos visuales</h3>
          <ul>
            {deliverables.map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="brand-card__footer">Solicitá los archivos editables escribiendo a <a href="mailto:hola@hermanosjota.com">hola@hermanosjota.com</a>.</p>
        </article>
      </div>
    </section>
  );
}

function ContactForm({ sectionRef }) {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [success, setSuccess] = useState(null);
  const mensajeMax = 500;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value.slice(0, name === 'mensaje' ? mensajeMax : undefined) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log('Contacto enviado:', form);
    setSuccess('¡Gracias por escribirnos! Te responderemos dentro de las próximas 24 horas.');
    setForm({ nombre: '', email: '', mensaje: '' });
  }

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timeout);
  }, [success]);

  return (
    <section ref={sectionRef} className="contact" aria-label="Formulario de contacto">
      <h2>¿Necesitás asesoramiento?</h2>
      <p className="contact-intro">Dejanos tus datos y un especialista en mobiliario se comunicará con vos.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Mensaje
          <textarea
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Contanos qué ambiente querés transformar..."
          />
          <span className="char-count">{mensajeMax - form.mensaje.length} caracteres restantes</span>
        </label>
        <button type="submit">Enviar mensaje</button>
      </form>
      {success && <div className="success" role="status">{success}</div>}
    </section>
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
    fetch(`${API_BASE}/api/productos`)
      .then(r => {
        if (!r.ok) throw new Error('Error al cargar productos');
        return r.json();
      })
      .then(data => {
        setProducts(data);
        if (data.length) {
          const precios = data.map(p => p.precio);
          const bounds = {
            min: Math.min(...precios),
            max: Math.max(...precios)
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
        return productData ? { ...productData, quantity: item.quantity } : null;
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

  const cartSummary = useMemo(
    () => cart.reduce((acc, item) => ({
      quantity: acc.quantity + item.quantity,
      total: acc.total + item.precio * item.quantity
    }), { quantity: 0, total: 0 }),
    [cart]
  );

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

    const sorted = [...filtered];
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

  function handleAddToCart(product, quantity = 1) {
    if (!product) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min((item.quantity || 1) + quantity, product.stock || Infinity) }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setJustAdded(product.nombre);
  }

  function handleQuantityChange(productId, quantity) {
    setCart(prev =>
      prev
        .map(item => (
          item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        ))
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

  return (
    <div>
      <Navbar cartCount={cartSummary.quantity} onScrollToContact={handleScrollToContact} />
      <main className="container">
        <section className="catalog">
          <div className="catalog-header">
            <div>
              <h2>Catálogo</h2>
              <p className="catalog-subtitle">Filtrá y encontrá el mueble perfecto para tu hogar</p>
            </div>
            {justAdded && <div className="toast" role="status">{justAdded} agregado al carrito</div>}
          </div>

          <SearchFilters
            query={query}
            onQueryChange={setQuery}
            priceBounds={priceBounds}
            selectedPrice={selectedPrice}
            onPriceChange={setSelectedPrice}
            sort={sort}
            onSortChange={setSort}
            onlyInStock={onlyInStock}
            onToggleStock={setOnlyInStock}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {loading && (
            <div className="grid">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="skeleton-card" />
              ))}
            </div>
          )}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            filteredProducts.length ? (
              <div className="grid">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleSelect}
                    onAdd={handleAddToCart}
                    className={`fade-in-up delay-${index % 3}`}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <h3>No encontramos resultados</h3>
                <p>Modificá los filtros o limpiá la búsqueda para ver más productos.</p>
                <button type="button" className="link" onClick={() => { setQuery(''); setOnlyInStock(false); setSelectedPrice(priceBounds.max); setSelectedCategory('all'); }}>
                  Restablecer filtros
                </button>
              </div>
            )
          )}
        </section>

        <aside className="sidebar">
          <ProductDetail product={selected} onAdd={handleAddToCart} />
          <CartPanel
            items={cart}
            total={cartSummary.total}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
            onClear={handleClearCart}
          />
          <ContactForm sectionRef={contactRef} />
        </aside>
      </main>
      <BrandManual />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
