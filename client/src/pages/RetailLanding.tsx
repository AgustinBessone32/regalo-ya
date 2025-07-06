import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Users, 
  Star, 
  Shield, 
  TrendingUp, 
  Clock,
  Gift,
  Heart,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { MetaTags } from "@/components/MetaTags";

export default function RetailLanding() {
  return (
    <>
      <MetaTags
        title="RegaloYa para Retail - Soluciones de Regalos Colaborativos para Comercios"
        description="Potencia tu negocio retail con RegaloYa. Facilita regalos colaborativos para empleados, clientes y eventos especiales. Aumenta la fidelización y las ventas."
        url={window.location.href}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header/Navbar */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <Gift className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  RegaloYa
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="ghost" className="text-gray-700 hover:text-purple-600">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Empezar Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="block">Regalos Colaborativos</span>
                  <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    para tu Negocio Retail
                  </span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                  Transforma la experiencia de regalo en tu comercio. Facilita a tus clientes organizar regalos colaborativos 
                  para empleados, eventos especiales y celebraciones grupales.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/auth">
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                      Probar Gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3">
                    Ver Demo
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
                  <div className="flex items-center mb-6">
                    <ShoppingBag className="h-8 w-8 text-purple-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Regalo para Julia - Cumpleaños</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Meta: $50,000</span>
                      <span className="text-green-600 font-semibold">85% completado</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">12 colaboradores</span>
                      <span className="text-lg font-bold text-purple-600">$42,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits for Retail */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Beneficios para tu Negocio Retail
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aumenta la satisfacción de tus empleados y clientes con una plataforma que facilita los regalos colaborativos
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6 border-purple-100 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Aumenta la Fidelización</h3>
                  <p className="text-gray-600">
                    Empleados más comprometidos se traducen en mejor atención al cliente y mayor retención de personal.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-purple-100 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Fortalece el Equipo</h3>
                  <p className="text-gray-600">
                    Facilita la organización de regalos para cumpleaños, logros y eventos especiales del equipo.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 border-purple-100 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Ahorra Tiempo</h3>
                  <p className="text-gray-600">
                    Elimina la necesidad de coordinar manualmente las colectas para regalos grupales.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases for Retail */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Casos de Uso en el Sector Retail
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre cómo otros negocios retail están usando RegaloYa para mejorar su ambiente laboral
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cumpleaños de Empleados</h3>
                    <p className="text-gray-600">
                      Organiza regalos sorpresa para celebrar los cumpleaños de tu equipo de trabajo.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reconocimiento por Logros</h3>
                    <p className="text-gray-600">
                      Premia a empleados destacados con regalos colaborativos del equipo.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Eventos Especiales</h3>
                    <p className="text-gray-600">
                      Facilita regalos grupales para baby showers, despedidas y celebraciones de temporada.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Programas de Bienestar</h3>
                    <p className="text-gray-600">
                      Implementa iniciativas de bienestar con regalos colaborativos para promover la salud del equipo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
                  <div className="text-center">
                    <Star className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      "RegaloYa transformó nuestra cultura laboral"
                    </h3>
                    <p className="text-gray-600 mb-6">
                      "Desde que implementamos RegaloYa, nuestros empleados están más unidos y motivados. 
                      La organización de regalos es súper fácil y todos participan."
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">MG</span>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">María González</p>
                        <p className="text-sm text-gray-500">Gerente - Tienda Moda & Estilo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Pagos Seguros con MercadoPago
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tu negocio y tus empleados pueden confiar en la seguridad de MercadoPago para todos los pagos de regalos colaborativos
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Protección Total</h3>
                <p className="text-gray-600">Todas las transacciones están protegidas por la tecnología de seguridad de MercadoPago</p>
              </div>
              
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Proceso Simple</h3>
                <p className="text-gray-600">Tus empleados pueden contribuir de forma rápida y segura desde cualquier dispositivo</p>
              </div>
              
              <div className="text-center">
                <Heart className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confianza</h3>
                <p className="text-gray-600">Respaldado por la plataforma de pagos más confiable de Latinoamérica</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Empieza a Fortalecer tu Equipo Hoy
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Únete a cientos de negocios retail que ya están usando RegaloYa para crear un mejor ambiente laboral
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8 py-3">
                  Conocer Más
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Gift className="h-8 w-8 text-purple-400" />
                  <span className="text-2xl font-bold">RegaloYa</span>
                </div>
                <p className="text-gray-400">
                  La plataforma líder para organizar regalos colaborativos en el sector retail.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Producto</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/" className="hover:text-white transition-colors">Características</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Precios</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Demo</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Soporte</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Contacto</Link></li>
                  <li><Link to="/" className="hover:text-white transition-colors">Términos</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Soluciones por Industria</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/soluciones-retail" className="hover:text-white transition-colors">Retail</Link></li>
                  <li><Link to="/soluciones-oficinas" className="hover:text-white transition-colors">Oficinas</Link></li>
                  <li><Link to="/soluciones-restaurantes" className="hover:text-white transition-colors">Restaurantes</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 RegaloYa. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}