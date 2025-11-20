// models/associations.js
const Usuario = require('../Usuario');
const Fatec = require('../Fatec');
const Livro = require('../Livro');
const Reserva = require('../Reserva');
const Curso = require('../Curso');

const FatecCurso = require('../FatecCurso');
const LivroFatec = require('../LivroFatec');
const LivroCurso = require('../LivroCurso');

//-------------------------------------------------------------
//[ASSOCIAÇÃO Usuario <- Fatec]
    // Usuario "pertence a (uma) [belongsTo]" Fatec 
    // Nesse relacionamento usando o belongsTo, a fk_id_fatec fica em usuário
Usuario.belongsTo(Fatec, {
    foreignKey: {
        name: 'fk_id_fatec',
        allowNull: false,
    },
});

//-------------------------------------------------------------


//-------------------------------------------------------------
// [ASSOCIAÇÃO] Reserva pertence a um único usuário
Reserva.belongsTo(Usuario, {
    foreignKey: {
        name: 'fk_id_usuario',
        allowNull: false,
    },
    onDelete: 'CASCADE',
});
// [ASSOCIAÇÃO] Reserva pertence a uma única fatec
Reserva.belongsTo(Fatec, {
    foreignKey: {
        name: 'fk_id_fatec',
        allowNull: false,
    }
});
// [ASSOCIAÇÃO] Reserva pertence a um único livro
Reserva.belongsTo(Livro, {
    foreignKey: {
        name: 'fk_id_livro',
        allowNull: false,
    }
});

// [ASSOCIAÇÃO] Um usuário pode ter várias reservas
Usuario.hasMany(Reserva, {
    foreignKey: 'fk_id_usuario',
    onDelete: 'CASCADE',
});
// [ASSOCIAÇÃO] Uma fatec pode ter várias reservas
Fatec.hasMany(Reserva, {
    foreignKey: 'fk_id_fatec'
});
// [ASSOCIAÇÃO] Um livro pode ser reservado várias vezes
Livro.hasMany(Reserva, {
    foreignKey: 'fk_id_livro'
});
//-------------------------------------------------------------

//-------------------------------------------------------------
// [ASSOCIAÇÃO] Muitos-para-Muitos: Fatec <-> Curso
Fatec.belongsToMany(Curso, { 
    through: FatecCurso, 
    foreignKey: 'fk_id_fatec', // Nome da FK que referencia Fatec
    otherKey: 'fk_id_curso'    // Nome da FK que referencia Curso
});

Curso.belongsToMany(Fatec, { 
    through: FatecCurso, 
    foreignKey: 'fk_id_curso', // Nome da FK que referencia Curso
    otherKey: 'fk_id_fatec'   // Nome da FK que referencia Fatec
});
//-------------------------------------------------------------

//-------------------------------------------------------------
// [ASSOCIAÇÃO] Muitos-para-Muitos: Livro <-> Fatec
Livro.belongsToMany(Fatec, { 
    through: LivroFatec, 
    foreignKey: 'fk_id_livro', 
    otherKey: 'fk_id_fatec'   
});
Fatec.belongsToMany(Livro, { 
    through: LivroFatec, 
    foreignKey: 'fk_id_fatec', 
    otherKey: 'fk_id_livro'  
});
//-------------------------------------------------------------


//-------------------------------------------------------------
// [ASSOCIAÇÃO] Muitos-para-Muitos: Livro <-> Curso
Livro.belongsToMany(Curso, { 
    through: LivroCurso, 
    foreignKey: 'fk_id_livro', 
    otherKey: 'fk_id_curso'   
});
Curso.belongsToMany(Livro, { 
    through: LivroCurso, 
    foreignKey: 'fk_id_curso', 
    otherKey: 'fk_id_livro'  
});
//-------------------------------------------------------------


//-------------------------------------------------------------
// [ASSOCIAÇÃO] Relações Diretas com as Tabelas de Junção (belongsTo)
// Define que cada entrada na tabela de junção pertence a um registro
// das tabelas principais. Essencial para o 'include' funcionar corretamente.
//-------------------------------------------------------------

// Tabela de junção FatecCurso
FatecCurso.belongsTo(Curso, { foreignKey: 'fk_id_curso' });
FatecCurso.belongsTo(Fatec, { foreignKey: 'fk_id_fatec' });

// Tabela de junção LivroFatec (é necessário fazer indo e voltando)
LivroFatec.belongsTo(Livro, { foreignKey: 'fk_id_livro' });
// Livro -> LivroFatec
Livro.hasMany(LivroFatec, { foreignKey: 'fk_id_livro' });

LivroFatec.belongsTo(Fatec, { foreignKey: 'fk_id_fatec' });
// Fatec -> LivroFatec
Fatec.hasMany(LivroFatec, { foreignKey: 'fk_id_fatec' });

// Tabela de junção LivroCurso
LivroCurso.belongsTo(Livro, { foreignKey: 'fk_id_livro' });
LivroCurso.belongsTo(Curso, { foreignKey: 'fk_id_curso' });






//-------------------------------------------------------------


module.exports = { Usuario, Reserva, LivroFatec, LivroCurso, Livro, FatecCurso, Fatec, Curso };