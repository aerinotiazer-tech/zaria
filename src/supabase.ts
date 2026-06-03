import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://naingtjlegmbapbxkdcn.supabase.co';
const supabaseKey = 'sb_publishable_fYGTXInv6v253clTwFBBUw_H-K0pPJg';

export const supabase = createClient(supabaseUrl, supabaseKey);
