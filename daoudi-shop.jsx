import { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import logo from"./logoo.jpeg";

const WHATSAPP_NUMBER = "32465150112";
const ABDELKADER_WHATSAPP_NUMBER = "212604326294";
const ADMIN_PASSWORD = "daoudi2028";

// Compresser une image avant stockage
function compressImage(dataUrl, maxSize = 600, quality = 0.5) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round((h * maxSize) / w); w = maxSize; }
        else { w = Math.round((w * maxSize) / h); h = maxSize; }
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

function ProductCard({ product, isAdmin, onRemove, onBuy, onBuyAbdelkader }) {
  const [currentImg, setCurrentImg] = useState(0);
  const images = product.images || [];

  return (
    <div style={{
      background: "#111", borderRadius: 18, overflow: "hidden",
      border: "1px solid #1a1a1a"
    }}>
      <div style={{ position: "relative", background: "#0e0e0e" }}>
        <img
          src={images[currentImg]}
          alt={product.name}
          style={{
            width: "100%", display: "block",
            maxHeight: 500, objectFit: "contain",
            background: "#0a0a0a"
          }}
        />

        {images.length > 1 && (
          <>
            <button onClick={() => setCurrentImg(i => (i - 1 + images.length) % images.length)} style={{
              position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.7)", color: "#fff", border: "none",
              width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center"
            }}>&#8249;</button>
            <button onClick={() => setCurrentImg(i => (i + 1) % images.length)} style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.7)", color: "#fff", border: "none",
              width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
              fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center"
            }}>&#8250;</button>
          </>
        )}

        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 6
          }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrentImg(i)} style={{
                width: i === currentImg ? 20 : 8, height: 8,
                borderRadius: 4, border: "none", cursor: "pointer",
                background: i === currentImg ? "#c1272d" : "rgba(255,255,255,0.4)",
                transition: "all 0.2s"
              }} />
            ))}
          </div>
        )}

        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          padding: "5px 10px", borderRadius: 8, fontSize: 11,
          fontWeight: 600, color: "#fff"
        }}>MA - Original</div>

        {images.length > 1 && (
          <div style={{
            position: "absolute", top: 12, right: isAdmin ? 52 : 12,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            padding: "5px 10px", borderRadius: 8, fontSize: 11,
            fontWeight: 600, color: "#fff"
          }}>{currentImg + 1} / {images.length}</div>
        )}

        {isAdmin && (
          <button onClick={() => onRemove(product.id)} style={{
            position: "absolute", top: 12, right: 12,
            background: "rgba(193,39,45,0.9)", color: "#fff", border: "none",
            width: 34, height: 34, borderRadius: 10,
            cursor: "pointer", fontSize: 16, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>X</button>
        )}
      </div>

      {images.length > 1 && (
        <div style={{
          display: "flex", gap: 6, padding: "10px 12px",
          overflowX: "auto", background: "#0e0e0e"
        }}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setCurrentImg(i)} style={{
              width: 56, height: 56, objectFit: "cover", borderRadius: 8,
              cursor: "pointer", flexShrink: 0,
              border: i === currentImg ? "2px solid #c1272d" : "2px solid transparent",
              opacity: i === currentImg ? 1 : 0.5,
              transition: "all 0.2s"
            }} />
          ))}
        </div>
      )}

      <div style={{ padding: "16px 20px 20px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{product.name}</h3>
        <div style={{
          fontSize: 26, fontWeight: 900, marginBottom: 16,
          background: "linear-gradient(135deg, #e8c97a, #c9a96e)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          display: "inline-block"
        }}>
          {product.price} <span style={{ fontSize: 14, fontWeight: 500 }}>EURO</span>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <button onClick={() => onBuy(product)} style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(135deg, #25d366, #128c3e)",
            color: "#fff", border: "none", borderRadius: 12,
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 16px rgba(37,211,102,0.2)"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.71-1.248A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.329-.726-6.033-1.96a.5.5 0 00-.395-.084l-3.088.818.856-3.196a.5.5 0 00-.069-.421C1.97 15.47 1.333 13.327 1.333 12 1.333 6.107 6.107 1.333 12 1.333S22.667 6.107 22.667 12 17.893 22 12 22z" fillRule="evenodd"/>
            </svg>
            Contacter Daoudi
          </button>

          <button onClick={() => onBuyAbdelkader(product)} style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(135deg, #006233, #05914b)",
            color: "#fff", border: "none", borderRadius: 12,
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 16px rgba(0,145,71,0.2)"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.71-1.248A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.329-.726-6.033-1.96a.5.5 0 00-.395-.084l-3.088.818.856-3.196a.5.5 0 00-.069-.421C1.97 15.47 1.333 13.327 1.333 12 1.333 6.107 6.107 1.333 12 1.333S22.667 6.107 22.667 12 17.893 22 12 22z" fillRule="evenodd"/>
            </svg>
            Contacter Abdelkader
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DaoudiShop() {
  const [products, setProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPreviews, setNewPreviews] = useState([]);
  const [toast, setToast] = useState(null);
  const [logoSrc, setLogoSrc] = useState(logo);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const logoRef = useRef(null);

  // Ecouter les produits en temps reel depuis Firestore
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true); setShowLogin(false); setPassword(""); setLoginError(false);
      showToastMsg("Bienvenue Daoudi !");
    } else setLoginError(true);
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const compressed = await compressImage(ev.target.result);
        setNewPreviews(prev => [...prev, compressed]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewImage = (index) => {
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addProduct = async () => {
    if (!newName || !newPrice || newPreviews.length === 0) {
      showToastMsg("Remplis tous les champs + au moins 1 photo !");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: newName,
        price: parseFloat(newPrice),
        images: newPreviews,
        createdAt: Date.now()
      });

      setNewName(""); setNewPrice(""); setNewPreviews([]);
      if (fileRef.current) fileRef.current.value = "";
      showToastMsg("Produit ajoute !");
    } catch (error) {
      console.error("Erreur:", error);
      showToastMsg("Erreur lors de l'ajout !");
    }
    setLoading(false);
  };

  const removeProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      showToastMsg("Produit supprime");
    } catch (error) {
      console.error("Erreur suppression:", error);
      showToastMsg("Erreur lors de la suppression !");
    }
  };

  const openWhatsApp = (number, product) => {
    const msg = encodeURIComponent(
      `Bonjour Daoudi-Shop !\nJe suis interesse par :\n\nProduit : ${product.name}\nPrix : ${product.price} EURO\n\nEst-ce encore disponible ?`
    );
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank");
  };

  const buyProduct = (product) => openWhatsApp(WHATSAPP_NUMBER, product);
  const buyProductAbdelkader = (product) => openWhatsApp(ABDELKADER_WHATSAPP_NUMBER, product);

  const showToastMsg = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const inputStyle = {
    width: "100%", padding: "13px 16px", marginBottom: 10,
    background: "#151515", border: "1px solid #222", borderRadius: 12,
    color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Cpath d='M30 10L50 30L30 50L10 30Z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px"
      }} />

      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: "linear-gradient(135deg, #c1272d, #006233)", color: "#fff",
          padding: "12px 28px", borderRadius: 50, fontWeight: 600, fontSize: 14,
          boxShadow: "0 8px 32px rgba(193,39,45,0.4)", animation: "slideDown 0.4s ease"
        }}>{toast}</div>
      )}

      {showLogin && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.9)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: 24,
          backdropFilter: "blur(10px)"
        }} onClick={() => { setShowLogin(false); setLoginError(false); setPassword(""); }}>
          <div style={{
            background: "linear-gradient(180deg, #141414, #0b0b0b)",
            borderRadius: 24, padding: "40px 32px", width: "100%", maxWidth: 380,
            border: "1px solid #222", boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 70, height: 70, borderRadius: "50%", margin: "0 auto 16px",
                background: "linear-gradient(135deg, #c1272d, #006233)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 900, color: "#fff",
                boxShadow: "0 4px 20px rgba(193,39,45,0.3)"
              }}>D</div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Espace Admin</h2>
              <p style={{ color: "#555", fontSize: 13, margin: "8px 0 0" }}>Acces reserve au proprietaire</p>
            </div>
            <input type="password" placeholder="Mot de passe" value={password}
              onChange={e => { setPassword(e.target.value); setLoginError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "14px 18px", marginBottom: 12,
                background: "#1a1a1a", border: `2px solid ${loginError ? "#c1272d" : "#252525"}`,
                borderRadius: 14, color: "#fff", fontSize: 18, textAlign: "center",
                letterSpacing: 6, outline: "none", boxSizing: "border-box"
              }} autoFocus
            />
            {loginError && <p style={{ color: "#c1272d", fontSize: 13, margin: "-4px 0 12px", textAlign: "center" }}>Mot de passe incorrect</p>}
            <button onClick={handleLogin} style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #c1272d, #a01f25)",
              color: "#fff", border: "none", borderRadius: 14,
              fontWeight: 700, fontSize: 16, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(193,39,45,0.3)"
            }}>Se connecter</button>
          </div>
        </div>
      )}

      <header style={{
        position: "relative", zIndex: 1,
        background: "linear-gradient(180deg, #111 0%, #0b0b0b 100%)",
        borderBottom: "1px solid #1a1a1a"
      }}>
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #c1272d 0%, #c1272d 33%, #fff 33%, #fff 40%, #006233 40%, #006233 60%, #fff 60%, #fff 67%, #c1272d 67%, #c1272d 100%)"
        }} />

        <div style={{ padding: "28px 24px 24px", textAlign: "center" }}>
          <div style={{ marginBottom: 16 }}>
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" style={{
                width: 250, height: 300, objectFit: "contain",
                filter: "drop-shadow(0 4px 12px rgba(193,39,45,0.3))"
              }} />
            ) : (
              <div style={{
                width: 150, height: 150, borderRadius: "50%", margin: "0 auto",
                background: "linear-gradient(135deg, #c1272d, #006233)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 900, color: "#fff",
                border: "3px solid #1a1a1a"
              }}>D</div>
            )}
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 7vw, 48px)", fontWeight: 900, margin: 0,
            letterSpacing: -1, lineHeight: 1.1,
            background: "linear-gradient(135deg, #fff 0%, #e8c97a 50%, #c9a96e 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>DAOUDI SHOP</h1>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            margin: "10px 0 6px", padding: "6px 16px",
            background: "rgba(193,39,45,0.1)", borderRadius: 50,
            border: "1px solid rgba(193,39,45,0.2)"
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: "#006233" }}>MA</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#c1272d", letterSpacing: 2, textTransform: "uppercase" }}>
              Maillots du Maroc
            </span>
          </div>

          <p style={{ color: "#fff", margin: "10px 0 18px", fontSize: 13, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
            Les maillots officiels de l'equipe nationale -- Qualite premium, livraison partout en Europe.
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {isAdmin ? (
              <>
                <span style={{
                  padding: "8px 16px", borderRadius: 50, fontSize: 12, fontWeight: 600,
                  color: "#006233", border: "1px solid #006233", background: "rgba(0,98,51,0.1)"
                }}>Admin connecte</span>
                <button onClick={() => logoRef.current?.click()} style={{
                  background: "rgba(193,39,45,0.1)", color: "#c1272d",
                  border: "1px solid rgba(193,39,45,0.3)",
                  padding: "8px 16px", borderRadius: 50, cursor: "pointer",
                  fontSize: 12, fontWeight: 600
                }}>Changer Logo</button>
                <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
                <button onClick={() => { setIsAdmin(false); showToastMsg("Deconnecte"); }} style={{
                  background: "transparent", color: "#555", border: "1px solid #222",
                  padding: "8px 16px", borderRadius: 50, cursor: "pointer", fontSize: 12
                }}>Deconnexion</button>
              </>
            ) : (
              <button onClick={() => setShowLogin(true)} style={{
                background: "transparent", color: "#333", border: "1px solid #1a1a1a",
                padding: "8px 18px", borderRadius: 50, cursor: "pointer", fontSize: 12
              }}>Admin</button>
            )}
          </div>
        </div>
      </header>

      {isAdmin && (
        <div style={{
          position: "relative", zIndex: 1,
          margin: "0 auto", maxWidth: 520, padding: "24px",
          background: "linear-gradient(180deg, #111, #0e0e0e)",
          borderBottom: "1px solid #1a1a1a"
        }}>
          <h3 style={{
            margin: "0 0 18px", fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #c1272d, #006233)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: "#fff", fontWeight: 700
            }}>+</span>
            Ajouter un maillot
          </h3>

          <input type="text" placeholder="Ex: Maillot Domicile 2026" value={newName}
            onChange={e => setNewName(e.target.value)} style={inputStyle} disabled={loading} />
          <input type="number" placeholder="Prix en EURO" value={newPrice}
            onChange={e => setNewPrice(e.target.value)} style={inputStyle} disabled={loading} />

          <div onClick={() => !loading && fileRef.current?.click()} style={{
            width: "100%", marginBottom: 12, borderRadius: 14,
            border: "2px dashed #252525", overflow: "hidden",
            cursor: loading ? "wait" : "pointer", boxSizing: "border-box",
            background: "#131313", padding: newPreviews.length > 0 ? 12 : "28px 16px",
            textAlign: "center", opacity: loading ? 0.5 : 1
          }}>
            {newPreviews.length === 0 ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 6, opacity: 0.4, color: "#fff" }}>+</div>
                <div style={{ color: "#444", fontSize: 13, fontWeight: 500 }}>Ajouter des photos (plusieurs possibles)</div>
                <div style={{ color: "#333", fontSize: 11, marginTop: 4 }}>JPG - PNG - WEBP</div>
              </>
            ) : (
              <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
                {newPreviews.length} photo{newPreviews.length > 1 ? "s" : ""} - Clique pour en ajouter
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImagesChange} style={{ display: "none" }} />
          </div>

          {newPreviews.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {newPreviews.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={img} alt="" style={{
                    width: 72, height: 72, objectFit: "cover",
                    borderRadius: 10, border: "1px solid #222"
                  }} />
                  <button onClick={(e) => { e.stopPropagation(); removeNewImage(i); }} style={{
                    position: "absolute", top: -6, right: -6,
                    background: "#c1272d", color: "#fff", border: "none",
                    width: 20, height: 20, borderRadius: "50%",
                    cursor: "pointer", fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>X</button>
                </div>
              ))}
            </div>
          )}

          <button onClick={addProduct} disabled={loading} style={{
            width: "100%", padding: "14px",
            background: loading ? "#333" : "linear-gradient(135deg, #c1272d, #a01f25)",
            color: "#fff", border: "none", borderRadius: 12,
            fontWeight: 700, fontSize: 15, cursor: loading ? "wait" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(193,39,45,0.25)"
          }}>{loading ? "Envoi en cours..." : "Ajouter le maillot"}</button>
        </div>
      )}

      <div style={{
        position: "relative", zIndex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 20, padding: "24px", maxWidth: 1000, margin: "0 auto"
      }}>
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            isAdmin={isAdmin}
            onRemove={removeProduct}
            onBuy={buyProduct}
            onBuyAbdelkader={buyProductAbdelkader}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div style={{
          position: "relative", zIndex: 1,
          textAlign: "center", padding: "60px 24px",
          maxWidth: 400, margin: "0 auto"
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%", margin: "0 auto 16px",
            background: "linear-gradient(135deg, #c1272d, #006233)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "#fff"
          }}>D</div>
          <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.6 }}>
            {isAdmin
              ? "Ajoute ton premier maillot ci-dessus pour commencer !"
              : "Les maillots arrivent bientot... Restez connectes !"}
          </p>
        </div>
      )}

      <footer style={{
        position: "relative", zIndex: 1,
        textAlign: "center", padding: "32px 24px 24px",
        borderTop: "1px solid #141414"
      }}>
        <div style={{
          height: 3, maxWidth: 120, margin: "0 auto 20px",
          background: "linear-gradient(90deg, #c1272d, #fff, #006233)",
          borderRadius: 2
        }} />
        <p style={{ color: "#2a2a2a", fontSize: 12, margin: 0 }}>
          2026 Daoudi Shop -- Maillots Officiels du Maroc
        </p>
      </footer>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        button { transition: transform 0.15s ease, opacity 0.15s ease; }
        button:hover { transform: scale(1.03); }
        button:active { transform: scale(0.97); }
        input:focus { border-color: #c1272d !important; }
        div[style*="dashed"]:hover { border-color: #c1272d !important; }
        @media (max-width: 600px) {
          div[style*="grid"] { padding: 16px !important; gap: 14px !important; }
        }
      `}</style>
    </div>
  );
}