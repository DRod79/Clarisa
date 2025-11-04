import React from 'react';
import FormWizard from '@/components/diagnostico/FormWizard';
import Header from '@/components/landing/Header';

const DiagnosticoPage = () => {
  return (
    <div className="diagnostico-page min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50">
      <Header />
      <div className="pt-20">
        <FormWizard />
      </div>
    </div>
  );
};

export default DiagnosticoPage;