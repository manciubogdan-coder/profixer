import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { COUNTIES } from "@/lib/constants";
import { activateInitialSubscription } from '@/lib/subscription';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Prenumele trebuie să aibă cel puțin 2 caractere.",
  }),
  lastName: z.string().min(2, {
    message: "Numele trebuie să aibă cel puțin 2 caractere.",
  }),
  email: z.string().email({
    message: "Adresa de email nu este validă.",
  }),
  phone: z.string().min(10, {
    message: "Numărul de telefon trebuie să aibă cel puțin 10 caractere.",
  }),
  password: z.string().min(6, {
    message: "Parola trebuie să aibă cel puțin 6 caractere.",
  }),
  confirmPassword: z.string(),
  accountType: z.enum(["client", "professional"]),
  county: z.string().min(1, {
    message: "Selectați județul.",
  }),
  city: z.string().min(1, {
    message: "Introduceți orașul.",
  }),
  address: z.string().min(1, {
    message: "Introduceți adresa.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolele nu coincid.",
  path: ["confirmPassword"],
});

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      accountType: "client",
      county: "",
      city: "",
      address: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', values.phone)
        .maybeSingle();
      
      if (existingUser) {
        toast.error('Un utilizator cu acest număr de telefon există deja');
        setIsLoading(false);
        return;
      }
      
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            country: 'România',
            county: values.county,
            city: values.city,
            address: values.address,
            role: values.accountType,
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Această adresă de email este deja înregistrată');
        } else {
          toast.error('Eroare la înregistrare: ' + error.message);
        }
        console.error(error);
        return;
      }

      // If the user is a professional, activate their subscription
      if (values.accountType === 'professional' && data.user) {
        console.log('New professional account created, activating subscription for:', data.user.id);
        
        // Activate subscription until July 1, 2025
        const endDate = new Date(2025, 6, 1);
        const success = await activateInitialSubscription(data.user.id, endDate);
        
        if (success) {
          console.log('Initial subscription activated successfully until:', endDate);
        } else {
          console.error('Failed to activate initial subscription');
        }
      }

      toast.success('Cont creat cu succes! Redirecționare...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error('A apărut o eroare la înregistrare. Vă rugăm să încercați din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prenume</FormLabel>
                <FormControl>
                  <Input placeholder="Prenume" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nume</FormLabel>
                <FormControl>
                  <Input placeholder="Nume" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input placeholder="07xxxxxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parolă</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmă parola</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tip cont</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează tipul de cont" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="professional">Meșter</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="county"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Județ</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează județul" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTIES.map((county) => (
                    <SelectItem key={county} value={county}>
                      {county}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oraș</FormLabel>
              <FormControl>
                <Input placeholder="Oraș" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresă</FormLabel>
              <FormControl>
                <Input placeholder="Adresă" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Se creează contul...
            </>
          ) : (
            "Creează cont"
          )}
        </Button>
      </form>
    </Form>
  );
}
