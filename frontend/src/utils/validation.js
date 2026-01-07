export const validators = {
  email: (value) => {
    if (!value) return "Email requis";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : "Email invalide";
  },

  password: (value) => {
    if (!value) return "Mot de passe requis";
    if (value.length < 8) return "Min. 8 caractères";
    if (!/[A-Z]/.test(value)) return "Une majuscule requise";
    if (!/[0-9]/.test(value)) return "Un chiffre requis";
    return null;
  },

  required: (value) => {
    return value?.trim() ? null : "Ce champ est requis";
  },

  minLength: (value, min) => {
    return value?.length >= min ? null : `Min. ${min} caractères`;
  },

  confirm: (password, confirm) => {
    return password === confirm ? null : "Les mots de passe ne correspondent pas";
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return "URL invalide";
    }
  },

  price: (value) => {
    if (!value) return null;
    if (isNaN(value) || Number(value) < 0) return "Prix invalide";
    return null;
  },
};

export const useFormValidation = (initialValues, onSubmit) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = (vals) => {
    const newErrors = {};
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
  };
};
