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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Adresa de email invalidă"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere"),
});

interface LoginFormProps {
  onToggleForm: () => void;
}

export const LoginForm = ({ onToggleForm }: LoginFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Autentificare reușită",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: error.message,
      });
      form.reset();
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
                  placeholder="Introduceți parola"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Autentificare
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={onToggleForm}
            className="text-primary"
            type="button"
          >
            Nu aveți cont? Înregistrați-vă
          </Button>
        </div>
      </form>
    </Form>
  );
};