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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

interface RegisterFormProps {
  onToggleForm: () => void;
}

export const RegisterForm = ({ onToggleForm }: RegisterFormProps) => {
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof registrationSchema>>({
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

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
        let errorMessage = "A apărut o eroare la crearea contului.";
        
        if (signUpError.message.includes("User already registered")) {
          errorMessage = "Există deja un cont cu această adresă de email.";
        }
        
        toast.error(errorMessage);
        return;
      }

      if (signUpData.user && values.role === "professional") {
        try {
          const freeTierEndDate = new Date("2025-03-30T23:59:59Z");
          
          const { error: rpcError } = await supabase.rpc('update_craftsman_subscription_status', {
            p_craftsman_id: signUpData.user.id,
            p_is_active: true,
            p_end_date: freeTierEndDate.toISOString()
          });

          if (rpcError) {
            console.error("Eroare la activarea abonamentului gratuit:", rpcError);
          } else {
            console.log("Abonament gratuit activat până la:", freeTierEndDate);
          }
        } catch (error) {
          console.error("Eroare la procesarea abonamentului gratuit:", error);
        }
      }

      if (signUpData.user) {
        toast.success("Cont creat cu succes! Vă rugăm să vă verificați emailul pentru confirmare.");
        form.reset();
        navigate("/");
      }
      
    } catch (error) {
      toast.error("A apărut o eroare neașteptată. Vă rugăm să încercați din nou.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@exemplu.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parolă</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Alegeți o parolă"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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

        <Button type="submit" className="w-full">
          Creare cont
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={onToggleForm}
            className="text-primary"
            type="button"
          >
            Aveți deja cont? Autentificați-vă
          </Button>
        </div>
      </form>
    </Form>
  );
};
