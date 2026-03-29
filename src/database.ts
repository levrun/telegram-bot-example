import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Member {
  id?: number;
  name: string;
  telegram_username?: string;
  telegram_user_id?: number;
  email?: string;
  phone?: string;
  role?: string;
  joined_date?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and ANON KEY are required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async addMember(member: Member): Promise<{ success: boolean; member?: Member; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('members')
        .insert([member])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, member: data };
    } catch (error) {
      return { success: false, error: `Database error: ${error}` };
    }
  }

  async removeMember(identifier: string | number): Promise<{ success: boolean; error?: string }> {
    try {
      let result;

      // If identifier is a number, search by ID
      if (typeof identifier === 'number') {
        result = await this.supabase
          .from('members')
          .delete()
          .eq('id', identifier);
      } else {
        // Otherwise, search by name (case-insensitive)
        result = await this.supabase
          .from('members')
          .delete()
          .ilike('name', `%${identifier}%`);
      }

      const { error, count } = result;

      if (error) {
        return { success: false, error: error.message };
      }

      if (count === 0) {
        return { success: false, error: 'Member not found' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: `Database error: ${error}` };
    }
  }

  async getAllMembers(): Promise<{ success: boolean; members?: Member[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('members')
        .select('*')
        .eq('status', 'Active')
        .order('name', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, members: data || [] };
    } catch (error) {
      return { success: false, error: `Database error: ${error}` };
    }
  }

  async findMember(identifier: string | number): Promise<{ success: boolean; member?: Member; error?: string }> {
    try {
      let query = this.supabase.from('members').select('*');

      // If identifier is a number, search by ID
      if (typeof identifier === 'number') {
        query = query.eq('id', identifier);
      } else {
        // Otherwise, search by name (case-insensitive)
        query = query.ilike('name', `%${identifier}%`);
      }

      const { data, error } = await query.single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, member: data };
    } catch (error) {
      return { success: false, error: `Database error: ${error}` };
    }
  }

  async updateMember(id: number, updates: Partial<Member>): Promise<{ success: boolean; member?: Member; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, member: data };
    } catch (error) {
      return { success: false, error: `Database error: ${error}` };
    }
  }

  async getMemberStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('members')
        .select('status, role')
        .eq('status', 'Active');

      if (error) {
        return { success: false, error: error.message };
      }

      const totalMembers = data?.length || 0;
      const roles = data?.reduce((acc: any, member) => {
        acc[member.role || 'Member'] = (acc[member.role || 'Member'] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        stats: {
          totalMembers,
          roles
        }
      };
    } catch (error) {
      return { success: false, error: `Database error: ${error}` };
    }
  }
}

export default DatabaseService;