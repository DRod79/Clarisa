import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Users } from 'lucide-react';

const ConfirmationPage = ({ email, nombre }) => {
  const navigate = useNavigate();

  return (
    <div data-testid="confirmation-page" className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-[#4CAF50]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          ¡Diagnóstico completado!
        </h1>

        {/* Message */}
        <div className="space-y-4 text-lg text-gray-600 mb-8">
          <p>
            Excelente, <span className="font-semibold text-gray-900">{nombre}</span>.
            Hemos recibido tus respuestas.
          </p>
          <p>
            En las próximas <span className="font-semibold text-[#2D5F3F]">48 horas</span> recibirás
            a{' '}
            <span className="font-semibold text-gray-900">{email}</span> tu informe
            personalizado de preparación S1/S2.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-green-50 to-slate-50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Mientras tanto:
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#4CAF50] mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                Revisa tu bandeja de entrada para el email de confirmación
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-[#4CAF50] mt-1 flex-shrink-0" />
              <p className="text-gray-700">
                Únete a nuestra comunidad de practicantes S1/S2
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-gray-600 mb-8">
          <p>¿Tienes alguna pregunta urgente?</p>
          <a
            href="mailto:hola@clarisa.com"
            className="text-[#4CAF50] font-semibold hover:text-[#2D5F3F] transition-colors"
          >
            Escríbenos: hola@clarisa.com
          </a>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate('/')}
          data-testid="back-to-home-btn"
          className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold px-8 py-6 rounded-lg transition-all hover:scale-105"
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationPage;