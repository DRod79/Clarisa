import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextNew';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AccesoPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState('email'); // 'email', 'login', 'register'
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    nombre_completo: '',
    organizacion: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  const checkEmailExists = async (emailToCheck) => {
    try {
      const response = await fetch(`${API}/auth/check-email?email=${encodeURIComponent(emailToCheck)}`);
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setLoading(true);

    try {
      const exists = await checkEmailExists(email);
      
      if (exists) {
        setStep('login');
        toast.info('Bienvenido de vuelta! Ingresa tu contraseña');
      } else {
        setStep('register');
        toast.info('Vamos a crear tu cuenta');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al verificar email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(email, formData.password);

      if (error) {
        toast.error('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.nombre_completo.trim()) {
      toast.error('Por favor ingresa tu nombre completo');
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
        email,
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

  const handleBack = () => {
    setStep('email');
    setFormData({
      password: '',
      nombre_completo: '',
      organizacion: '',
      confirmPassword: '',
      acceptTerms: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-[#2D5F3F]">Clarisa</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {step === 'email' && 'Accede a tu cuenta'}
          {step === 'login' && 'Ingresa tu contraseña'}
          {step === 'register' && 'Completa tu registro'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'email' && 'Ingresa tu email para continuar'}
          {step === 'login' && (
            <>
              ¿No recuerdas tu contraseña?{' '}
              <Link to="/recuperar-password" className="font-semibold text-[#4CAF50] hover:text-[#2D5F3F]">
                Recupérala aquí
              </Link>
            </>
          )}
          {step === 'register' && 'Ya tienes cuenta? Vuelve atrás para iniciar sesión'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* STEP 1: Email Input */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                    placeholder="tu.email@empresa.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </Button>

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
                      variant="outline"
                      className="w-full"
                    >
                      Hacer diagnóstico gratuito primero
                    </Button>
                  </Link>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: Login */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  {loading ? 'Iniciando...' : 'Iniciar sesión'}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Register */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
              </div>

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

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  Contraseña *
                </label>
                <div className="mt-1">
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña *
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4CAF50] focus:border-[#4CAF50] sm:text-sm"
                  />
                </div>
              </div>

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

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccesoPage;
