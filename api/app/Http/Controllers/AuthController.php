<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        try {
            // Aqui validamos os dados de entrada antes de criar o usuario.
            // O `unique:users,email` impede cadastro com e-mail repetido.
            $validated = $request->validate([
                'nome_completo' => ['required', 'string', 'max:150'],
                'email' => ['required', 'string', 'email', 'max:150', 'unique:users,email'],
                'senha' => ['required', 'string', 'min:6'],
            ], [
                'email.unique' => 'Este e-mail ja esta cadastrado.',
            ]);
        } catch (ValidationException $e) {
            // Quando a validacao falha, devolvemos 422 com os campos com erro.
            // Isso facilita mostrar mensagens claras no frontend.
            return response()->json([
                'message' => 'Dados invalidos.',
                'errors' => $e->errors(),
            ], 422);
        }

        $user = User::create([
            'nome_completo' => $validated['nome_completo'],
            'email' => $validated['email'],
            // A senha recebida (`senha`) e transformada em hash antes de salvar.
            // Assim nenhum dado sensivel fica armazenado em texto puro no banco.
            'senha_hash' => Hash::make($validated['senha']),
        ]);

        return response()->json([
            'message' => 'Usuario cadastrado com sucesso.',
            'user' => $user,
        ], 201);
    }
}
