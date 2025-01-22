import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";

const loginSchema = z.object({
  email: z.string().email("Adresa de email invalidă"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
});

const registrationSchema = z.object({
  email: z.string().email("Adresa de email invalidă"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
  firstName: z.string().min(2, "Prenumele este obligatoriu"),
  lastName: z.string().min(2, "Numele este obligatoriu"),
  phone: z.string().min(10, "Număr de telefon invalid"),
  country: z.string().min(2, "Țara este obligatorie"),
  county: z.string().min(2, "Județul este obligatoriu"),
  city: z.string().min(2, "Orașul este obligatoriu"),
  address: z.string().min(5, "Adresa este obligatorie"),
  role: z.enum(["client", "professional"]),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registrationForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      country: "",
      county: "",
      city: "",
      address: "",
      role: "client",
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    console.log("Încercare de autentificare cu:", values.email);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Eroare la autentificare:", error);
        
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email neverificat",
            description: "Vă rugăm să vă verificați emailul înainte de autentificare.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Eroare",
            description: "Email sau parolă invalidă. Vă rugăm să încercați din nou.",
          });
        }
        
        loginForm.setValue("password", "");
        throw error;
      }

      console.log("Autentificare reușită");
      toast({
        title: "Succes",
        description: "Autentificare reușită",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Eroare la autentificare:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (values: z.infer<typeof registrationSchema>) => {
    console.log("Încercare de înregistrare cu:", values.email);
    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            country: values.country,
            county: values.county,
            city: values.city,
            address: values.address,
            role: values.role,
          },
        },
      });

      if (signUpError) {
        console.error("Eroare la înregistrare:", signUpError);
        throw signUpError;
      }

      console.log("Înregistrare reușită");
      toast({
        title: "Cont creat cu succes",
        description: "Vă rugăm să vă verificați emailul pentru a confirma contul",
      });
      
      setIsLogin(true);
      registrationForm.reset();
    } catch (error: any) {
      console.error("Eroare la înregistrare:", error);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error.message || "Eroare la crearea contului",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-secondary p-8 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary">
              {isLogin ? "Bine ați revenit" : "Creați un cont nou"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isLogin
                ? "Autentificați-vă în contul dumneavoastră"
                : "Înregistrați-vă ca client sau profesionist"}
            </p>
          </div>

          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="email@exemplu.com" 
                          {...field}
                          className="bg-white text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parolă</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Introduceți parola"
                          {...field}
                          className="bg-white text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Se încarcă..." : "Autentificare"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registrationForm}>
              <form onSubmit={registrationForm.handleSubmit(handleRegistration)} className="space-y-6">
                <FormField
                  control={registrationForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="email@exemplu.com" 
                          {...field}
                          className="bg-background text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parolă</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Alegeți o parolă"
                          {...field}
                          className="bg-background text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prenume</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduceți prenumele" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nume</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduceți numele" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Număr de telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduceți numărul de telefon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Țară</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduceți țara" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Județ</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduceți județul" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oraș</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduceți orașul" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresă</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduceți adresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectați rolul" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="professional">Profesionist</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Se încarcă..." : "Creare cont"}
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                loginForm.reset();
                registrationForm.reset();
              }}
              className="text-primary"
            >
              {isLogin
                ? "Nu aveți cont? Înregistrați-vă"
                : "Aveți deja cont? Autentificați-vă"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
