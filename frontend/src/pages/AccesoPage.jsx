import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextNew';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const AccesoPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // true = login, false = registro
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    organizacion: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        toast.error('Email o contraseña incorrectos');
        setLoading(false);
        return;
      }

      toast.success('¡Bienvenido de vuelta!');
      
      // Redirect based on user role
      if (data.user.rol === 'admin') {
        navigate('/admin/home');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.email.trim() || !formData.nombre_completo.trim() || !formData.password) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!formData.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          nombre_completo: formData.nombre_completo,
          organizacion: formData.organizacion,
          rol: 'cliente_gratuito',
        }
      );

      if (error) {
        toast.error('Error al crear la cuenta: ' + error.message);
        setLoading(false);
        return;
      }

      toast.success('¡Cuenta creada exitosamente!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error al crear la cuenta');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset form when switching
    setFormData({
      email: '',
      password: '',
      nombre_completo: '',
      organizacion: '',
      confirmPassword: '',
      acceptTerms: false,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-[#2D5F3F]">Clarisa</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
            {/* Nombre completo - Solo en registro */}
            {!isLogin && (
              <div>
                <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700">
                  Nombre completo *
                </label>
                <div className="mt-1">
                  <input
                    id="nombre_completo"
                    name="nombre_completo"
                    type="text"
                    required
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                    placeholder="María González"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                  placeholder="tu.email@empresa.com"
                />
              </div>
            </div>

            {/* Organización - Solo en registro */}
            {!isLogin && (
              <div>
                <label htmlFor="organizacion" className="block text-sm font-medium text-gray-700">
                  Organización
                </label>
                <div className="mt-1">
                  <input
                    id="organizacion"
                    name="organizacion"
                    type="text"
                    value={formData.organizacion}
                    onChange={(e) => setFormData({ ...formData, organizacion: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
              </div>
            )}

            {/* Contraseña con toggle visible/oculta */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              )}
            </div>

            {/* Confirmar contraseña - Solo en registro */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Términos y condiciones - Solo en registro */}
            {!isLogin && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="h-4 w-4 text-[#4CAF50] focus:ring-[#4CAF50] border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="font-medium text-gray-700">
                    Acepto los términos y condiciones
                  </label>
                </div>
              </div>
            )}

            {/* Botón submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              {loading 
                ? (isLogin ? 'Iniciando...' : 'Creando cuenta...') 
                : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')
              }
            </Button>

            {/* Toggle entre login y registro */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-[#4CAF50] hover:text-[#2D5F3F] font-semibold"
              >
                {isLogin 
                  ? '¿No tienes cuenta? Regístrate' 
                  : '¿Ya tienes cuenta? Inicia sesión'
                }
              </button>
            </div>

            {/* Enlace al diagnóstico gratuito */}
            {isLogin && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      ¿Primera vez aquí?
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/diagnostico">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      Hacer diagnóstico gratuito primero
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccesoPage;
